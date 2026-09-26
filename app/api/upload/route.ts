import { NextRequest, NextResponse } from 'next/server';
import { getSetting, setSetting } from '@/lib/settings';
import { IMAGE_TYPES, MAX_IMAGE_BYTES, deleteMediaByUrl, saveMedia } from '@/lib/media';

// Images tracked by a setting instead of by the record that uses them.
const SETTING_FOR_TYPE: Record<string, string> = { logo: 'site_logo', hero: 'hero_image' };

// POST - upload an image (course photo; type=logo for the site logo,
// type=hero for the home page photo).
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

    const settingKey = typeof type === 'string' ? SETTING_FOR_TYPE[type] : undefined;
    if (settingKey) {
      const previous = await getSetting(settingKey);
      await setSetting(settingKey, url);
      await deleteMediaByUrl(previous);
      // The logo is served at /logo.png (see /api/logo).
      return NextResponse.json({ success: true, url: type === 'logo' ? '/logo.png' : url, size: file.size }, { status: 201 });
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
    const settingKey = SETTING_FOR_TYPE[body?.type];
    if (settingKey) {
      const previous = await getSetting(settingKey);
      await setSetting(settingKey, '');
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
