import { getBrowserClient } from './client';

export type StorageBucket = 'products' | 'avatars' | 'reviews' | 'returns';

export interface UploadResult {
  success: boolean;
  url?: string;
  publicUrl?: string;
  error?: string;
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function uploadFileToSupabase(
  bucket: StorageBucket,
  file: File,
  folder?: string
): Promise<UploadResult> {
  // 1. Validation
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      success: false,
      error: 'Invalid file format. Please upload JPEG, PNG, or WebP images only.',
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      success: false,
      error: 'File size exceeds 5MB limit. Please compress image before uploading.',
    };
  }

  const supabase = getBrowserClient();
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
  const filePath = folder ? `${folder}/${fileName}` : fileName;

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.warn(`Browser client storage upload rejected in [${bucket}], attempting secure server upload:`, error.message);
      // Fallback to server route with admin privileges
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', bucket);
      if (folder) formData.append('folder', folder);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        return { success: false, error: errJson.error || error.message };
      }

      const resData = await res.json();
      return {
        success: true,
        url: resData.url,
        publicUrl: resData.publicUrl,
      };
    }

    // Returns bucket is private (signed URLs or authenticated reads)
    if (bucket === 'returns') {
      const { data: signedData, error: signedError } = await supabase.storage
        .from(bucket)
        .createSignedUrl(data.path, 60 * 60 * 24 * 7); // 7 days

      if (signedError || !signedData?.signedUrl) {
        return { success: true, url: data.path, publicUrl: data.path };
      }
      return { success: true, url: signedData.signedUrl, publicUrl: signedData.signedUrl };
    }

    // Public buckets (products, avatars, reviews)
    const { data: publicData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      success: true,
      url: publicData.publicUrl,
      publicUrl: publicData.publicUrl,
    };
  } catch (err: any) {
    console.error('Unexpected storage upload exception:', err);
    return {
      success: false,
      error: err.message || 'Storage upload failed.',
    };
  }
}
