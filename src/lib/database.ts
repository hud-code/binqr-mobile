import { supabase } from './supabase';
import type { Box, Location, CreateBoxFormData } from './types';
import { v4 as uuidv4 } from 'uuid';

// Location functions
export const getStoredLocations = async (): Promise<Location[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching locations:', error);
      return [];
    }

    return data.map(location => ({
      id: location.id,
      user_id: location.user_id,
      name: location.name,
      description: location.description || undefined,
      created_at: location.created_at,
      updated_at: location.updated_at || location.created_at,
    }));
  } catch (error) {
    console.error('Error loading locations:', error);
    return [];
  }
};

export const saveLocation = async (location: { name: string; description?: string }): Promise<Location | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('locations')
      .insert({
        name: location.name,
        description: location.description || null,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      user_id: data.user_id,
      name: data.name,
      description: data.description || undefined,
      created_at: data.created_at,
      updated_at: data.created_at,
    };
  } catch (error) {
    console.error('Error saving location:', error);
    return null;
  }
};

export const updateLocation = async (locationId: string, updates: { name?: string; description?: string }): Promise<Location | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('locations')
      .update({
        ...(updates.name && { name: updates.name }),
        ...(updates.description !== undefined && { description: updates.description || null }),
      })
      .eq('id', locationId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      user_id: data.user_id,
      name: data.name,
      description: data.description || undefined,
      created_at: data.created_at,
      updated_at: data.created_at, // Use created_at since updated_at doesn't exist
    };
  } catch (error) {
    console.error('Error updating location:', error);
    return null;
  }
};

export const deleteLocation = async (locationId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', locationId)
      .eq('user_id', user.id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting location:', error);
    return false;
  }
};

// Box functions
export const getStoredBoxes = async (): Promise<Box[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('boxes')
      .select(`
        *,
        box_contents (content),
        locations (name)
      `)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching boxes:', error);
      return [];
    }

    return data.map(box => ({
      id: box.id,
      user_id: box.user_id,
      name: box.name,
      description: box.description || undefined,
      location_id: box.location_id,
      qr_code: box.qr_code,
      qr_code_url: box.image_url || undefined,
      photo_urls: box.image_url ? [box.image_url] : [],
      tags: [], // Could be extracted from box_contents later
      created_at: box.created_at,
      updated_at: box.updated_at,
      location: box.locations ? {
        id: box.location_id,
        user_id: user.id,
        name: box.locations.name,
        description: undefined,
        created_at: '',
        updated_at: '',
      } : undefined,
    }));
  } catch (error) {
    console.error('Error loading boxes:', error);
    return [];
  }
};

export const saveBox = async (boxData: CreateBoxFormData & { qr_code: string }): Promise<Box | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const boxId = uuidv4();
    const now = new Date().toISOString();

    // Insert the box
    const { data: boxResult, error: boxError } = await supabase
      .from('boxes')
      .insert({
        id: boxId,
        name: boxData.name,
        description: boxData.description || null,
        qr_code: boxData.qr_code,
        image_url: boxData.photos[0] || null,
        location_id: boxData.location_id,
        user_id: user.id,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (boxError) throw boxError;

    // Insert box contents (tags)
    if (boxData.tags.length > 0) {
      const contentsToInsert = boxData.tags.map(tag => ({
        box_id: boxId,
        content: tag,
      }));

      const { error: contentsError } = await supabase
        .from('box_contents')
        .insert(contentsToInsert);

      if (contentsError) {
        console.error('Error saving contents:', contentsError);
        // Don't throw - box is created, contents failed
      }
    }

    return {
      id: boxResult.id,
      user_id: boxResult.user_id,
      name: boxResult.name,
      description: boxResult.description || undefined,
      location_id: boxResult.location_id,
      qr_code: boxResult.qr_code,
      qr_code_url: boxResult.image_url || undefined,
      photo_urls: boxResult.image_url ? [boxResult.image_url] : [],
      tags: boxData.tags,
      created_at: boxResult.created_at,
      updated_at: boxResult.updated_at,
    };
  } catch (error) {
    console.error('Error saving box:', error);
    return null;
  }
};

export const getBoxByQRCode = async (qrCode: string): Promise<Box | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('boxes')
      .select(`
        *,
        box_contents (content),
        locations (name)
      `)
      .eq('qr_code', qrCode)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No rows returned
      }
      console.error('Error fetching box by QR code:', error);
      return null;
    }

    return {
      id: data.id,
      user_id: data.user_id,
      name: data.name,
      description: data.description || undefined,
      location_id: data.location_id,
      qr_code: data.qr_code,
      qr_code_url: data.image_url || undefined,
      photo_urls: data.image_url ? [data.image_url] : [],
      tags: data.box_contents?.map((bc: { content: string }) => bc.content) || [],
      created_at: data.created_at,
      updated_at: data.updated_at,
      location: data.locations ? {
        id: data.location_id,
        user_id: user.id,
        name: data.locations.name,
        description: undefined,
        created_at: '',
        updated_at: '',
      } : undefined,
    };
  } catch (error) {
    console.error('Error finding box by QR code:', error);
    return null;
  }
};

export const searchBoxes = async (query: string, locationId?: string): Promise<Box[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    let queryBuilder = supabase
      .from('boxes')
      .select(`
        *,
        box_contents (content),
        locations (name)
      `)
      .eq('user_id', user.id);

    // Add location filter if provided
    if (locationId && locationId !== 'all') {
      queryBuilder = queryBuilder.eq('location_id', locationId);
    }

    // Add text search if query provided
    if (query.trim()) {
      queryBuilder = queryBuilder.or(
        `name.ilike.%${query}%,description.ilike.%${query}%`
      );
    }

    const { data, error } = await queryBuilder.order('updated_at', { ascending: false });

    if (error) {
      console.error('Error searching boxes:', error);
      return [];
    }

    return data.map(box => ({
      id: box.id,
      user_id: box.user_id,
      name: box.name,
      description: box.description || undefined,
      location_id: box.location_id,
      qr_code: box.qr_code,
      qr_code_url: box.image_url || undefined,
      photo_urls: box.image_url ? [box.image_url] : [],
      tags: box.box_contents?.map((bc: { content: string }) => bc.content) || [],
      created_at: box.created_at,
      updated_at: box.updated_at,
      location: box.locations ? {
        id: box.location_id,
        user_id: user.id,
        name: box.locations.name,
        description: undefined,
        created_at: '',
        updated_at: '',
      } : undefined,
    }));
  } catch (error) {
    console.error('Error searching boxes:', error);
    return [];
  }
};

export const deleteBox = async (boxId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('boxes')
      .delete()
      .eq('id', boxId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting box:', error);
    return false;
  }
};

export const updateBox = async (boxId: string, updates: {
  name?: string;
  description?: string;
  photo_urls?: string[];
  tags?: string[];
  location_id?: string;
}): Promise<Box | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Update the box
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (updates.name) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description || null;
    if (updates.photo_urls) updateData.image_url = updates.photo_urls[0] || null;
    if (updates.location_id) updateData.location_id = updates.location_id;

    const { data: boxData, error: boxError } = await supabase
      .from('boxes')
      .update(updateData)
      .eq('id', boxId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (boxError) throw boxError;

    // Update box contents (tags) if provided
    if (updates.tags !== undefined) {
      // Delete existing contents
      const { error: deleteError } = await supabase
        .from('box_contents')
        .delete()
        .eq('box_id', boxId);

      if (deleteError) throw deleteError;

      // Insert new contents
      if (updates.tags.length > 0) {
        const contentsToInsert = updates.tags.map(tag => ({
          box_id: boxId,
          content: tag,
        }));

        const { error: contentsError } = await supabase
          .from('box_contents')
          .insert(contentsToInsert);

        if (contentsError) throw contentsError;
      }
    }

    // Return updated box
    return {
      id: boxData.id,
      user_id: boxData.user_id,
      name: boxData.name,
      description: boxData.description || undefined,
      location_id: boxData.location_id,
      qr_code: boxData.qr_code,
      qr_code_url: boxData.image_url || undefined,
      photo_urls: boxData.image_url ? [boxData.image_url] : [],
      tags: updates.tags || [],
      created_at: boxData.created_at,
      updated_at: boxData.updated_at,
    };
  } catch (error) {
    console.error('Error updating box:', error);
    return null;
  }
};

export const generateNewQRCode = async (boxId: string): Promise<string | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const newQRCode = `BinQR:${boxId}:${Date.now()}`; // Add timestamp for uniqueness

    const { error } = await supabase
      .from('boxes')
      .update({
        qr_code: newQRCode,
        updated_at: new Date().toISOString(),
      })
      .eq('id', boxId)
      .eq('user_id', user.id);

    if (error) throw error;
    return newQRCode;
  } catch (error) {
    console.error('Error generating new QR code:', error);
    return null;
  }
}; 