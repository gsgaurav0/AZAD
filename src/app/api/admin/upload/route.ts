import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const bucket = (formData.get('bucket') as string) || 'products';
    const folder = (formData.get('folder') as string) || '';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const admin = createAdminClient();

    // Ensure bucket exists
    try {
      const { data: buckets } = await admin.storage.listBuckets();
      const bucketExists = buckets?.some((b) => b.name === bucket);
      if (!bucketExists) {
        await admin.storage.createBucket(bucket, {
          public: bucket !== 'returns',
          fileSizeLimit: 10485760, // 10MB
        });
      }
    } catch (bErr) {
      console.warn('Bucket ensure notice:', bErr);
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await admin.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: file.type || 'image/jpeg',
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.error('Admin storage upload error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const { data: publicData } = admin.storage.from(bucket).getPublicUrl(data.path);

    return NextResponse.json({
      success: true,
      url: publicData.publicUrl,
      publicUrl: publicData.publicUrl,
      path: data.path,
    });
  } catch (err: any) {
    console.error('Admin storage upload exception:', err);
    return NextResponse.json({ error: err.message || 'File upload failed' }, { status: 500 });
  }
}
