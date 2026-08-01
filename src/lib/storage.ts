import { v4 as uuidv4 } from "uuid";
import { supabase } from "./supabase";

const BOX_PHOTOS_BUCKET = "box-photos";

function getExtension(uri: string, mimeType?: string | null): string {
  const fromUri = uri.split("?")[0].split(".").pop()?.toLowerCase();
  if (fromUri && fromUri.length <= 5 && /^[a-z0-9]+$/.test(fromUri)) {
    return fromUri === "jpeg" ? "jpg" : fromUri;
  }
  if (mimeType?.includes("png")) return "png";
  if (mimeType?.includes("webp")) return "webp";
  if (mimeType?.includes("gif")) return "gif";
  return "jpg";
}

function getContentType(ext: string): string {
  switch (ext) {
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    default:
      return "image/jpeg";
  }
}

/** Returns true when the URI still points at a local device file. */
export function isLocalImageUri(uri: string): boolean {
  return (
    uri.startsWith("file://") ||
    uri.startsWith("content://") ||
    uri.startsWith("ph://") ||
    uri.startsWith("assets-library://") ||
    (!uri.startsWith("http://") && !uri.startsWith("https://"))
  );
}

/**
 * Upload a local box photo to Supabase Storage at
 * `box-photos/{userId}/{uuid}.{ext}` and return its public URL.
 * Remote http(s) URLs are returned unchanged.
 */
export async function uploadBoxPhoto(
  localUri: string,
  mimeType?: string | null
): Promise<string> {
  if (!isLocalImageUri(localUri)) {
    return localUri;
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("You must be signed in to upload photos.");
  }

  const ext = getExtension(localUri, mimeType);
  const path = `${user.id}/${uuidv4()}.${ext}`;
  const contentType = getContentType(ext);

  const response = await fetch(localUri);
  if (!response.ok) {
    throw new Error("Failed to read the photo from this device.");
  }

  const arrayBuffer = await response.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from(BOX_PHOTOS_BUCKET)
    .upload(path, arrayBuffer, {
      contentType,
      upsert: false,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage
    .from(BOX_PHOTOS_BUCKET)
    .getPublicUrl(path);

  if (!data?.publicUrl) {
    throw new Error("Upload succeeded but no public URL was returned.");
  }

  return data.publicUrl;
}
