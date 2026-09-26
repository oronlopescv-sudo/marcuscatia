import { NextRequest, NextResponse } from 'next/server';
import { getSetting, setSetting } from '@/lib/settings';
import { IMAGE_TYPES, MAX_IMAGE_BYTES, deleteMediaByUrl, saveMedia } from '@/lib/media';

// POST - upload an image (course photo, or the site logo with type=logo).
// Stored in MySQL; returns the URL to use in the site.
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const type = formData.get('type');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    if (!IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPEG, PNG, WebP or GIF images are allowed' }, { status: 400 });
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    const url = await saveMedia(Buffer.from(await file.arrayBuffer()), file.type);

    // The logo is served at /logo.png (see /api/logo); remember which upload it is.
    if (type === 'logo') {
      const previous = await getSetting('site_logo');
      await setSetting('site_logo', url);
      await deleteMediaByUrl(previous);
      return NextResponse.json({ success: true, url: '/logo.png', size: file.size }, { status: 201 });
    }

    return NextResponse.json({ success: true, url, size: file.size }, { status: 201 });
  } catch (error) {
    console.error('POST /api/upload error:', error);
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE - remove an uploaded image (body: { url }). Only images stored in
// MySQL are removed; the default logo and site photos are never touched.
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    if (body?.type === 'logo') {
      const previous = await getSetting('site_logo');
      await setSetting('site_logo', '');
      await deleteMediaByUrl(previous);
      return NextResponse.json({ success: true });
    }
    await deleteMediaByUrl(body?.url);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Delete failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
