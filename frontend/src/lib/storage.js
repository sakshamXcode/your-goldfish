// frontend/src/lib/storage.js (robust across supabase-js versions)
import { supabase } from './supabaseClient';

export async function uploadImageToStorage(file) {
  if (!file) return null;
  if (!supabase) {
    console.warn('[storage] supabase client missing - cannot upload, returning null');
    return null;
  }

  try {
    const bucket = 'idea-photos';
    const ts = Date.now();
    const safeName = `${ts}_${Math.random().toString(36).slice(2,8)}_${file.name.replace(/\s+/g,'_')}`;
    const path = `ideas/${safeName}`;

    const uploadResult = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

    // uploadResult shape differs by supabase-js version:
    // - v1: { publicURL, error }
    // - v2: { data, error }
    if (uploadResult?.error) {
      console.warn('[storage] upload error', uploadResult.error);
      return null;
    }

    // Try v1 style:
    if (uploadResult?.publicURL) return uploadResult.publicURL;

    // Try v2 style:
    if (uploadResult?.data) {
      // Either data.Key or data.path depending on version; construct a public URL via getPublicUrl
      const getter = await supabase.storage.from(bucket).getPublicUrl(path);
      // getter might be { publicURL } (v1) or { data: { publicUrl }, error } (v2)
      if (getter?.publicURL) return getter.publicURL;
      if (getter?.data?.publicUrl) return getter.data.publicUrl;
      if (getter?.data?.publicURL) return getter.data.publicURL;
    }

    // As a last resort, attempt to build Supabase public URL pattern:
    if (process?.env?.VITE_SUPABASE_URL) {
      // Public URL pattern: https://<project>.supabase.co/storage/v1/object/public/{bucket}/{path}
      try {
        const base = import.meta.env.VITE_SUPABASE_URL || '';
        return `${base.replace(/\/$/, '')}/storage/v1/object/public/${bucket}/${encodeURIComponent(path)}`;
      } catch (e) {
        console.warn('[storage] fallback public url build failed', e);
      }
    }

    return null;
  } catch (err) {
    console.error('[storage] unexpected upload error', err);
    return null;
  }
}

export default { uploadImageToStorage };
