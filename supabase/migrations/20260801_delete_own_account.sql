-- Account deletion for App Store Guideline 5.1.1(v)
--
-- HOW TO APPLY (run in Supabase Dashboard → SQL Editor):
-- 1. Open https://supabase.com/dashboard → your BinQR project → SQL Editor
-- 2. Paste this entire file and click Run
-- 3. Confirm the function exists:
--      select proname from pg_proc where proname = 'delete_own_account';
-- 4. From the mobile app, Settings → Delete Account calls:
--      supabase.rpc('delete_own_account')
--
-- The function is SECURITY DEFINER so it can delete the caller's auth.users row
-- after wiping user-owned app data. It only acts on auth.uid().

CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Remove box contents for boxes owned by this user
  DELETE FROM public.box_contents
  WHERE box_id IN (
    SELECT id FROM public.boxes WHERE user_id = uid
  );

  DELETE FROM public.boxes WHERE user_id = uid;
  DELETE FROM public.locations WHERE user_id = uid;
  DELETE FROM public.profiles WHERE id = uid;

  -- Remove the auth user (requires SECURITY DEFINER)
  DELETE FROM auth.users WHERE id = uid;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_own_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;

COMMENT ON FUNCTION public.delete_own_account() IS
  'Deletes the calling user''s app data and auth.users row. Used by BinQR mobile account deletion.';
