import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { query } from '@/lib/db';
import { getSetting } from '@/lib/settings';
import { ensureMediaTable, mediaIdFromUrl } from '@/lib/media';

// /logo.png is rewritten here: serves the logo uploaded in the admin (stored
// in MySQL), or the default public/logo.png.
export async function GET() {
  const headers = {
    'Cache-Control': 'public, max-age=0, must-revalidate',
    'X-Content-Type-Options': 'nosniff',
  };

  try {
    const id = mediaIdFromUrl(await getSetting('site_logo'));
    if (id) {
      await ensureMediaTable();
      const rows = (await query('SELECT mime, data FROM media_files WHERE id = ?', [id])) as { mime: string; data: Buffer }[];
      if (rows?.length) {
        return new NextResponse(new Uint8Array(rows[0].data), { headers: { ...headers, 'Content-Type': rows[0].mime } });
      }
    }
  } catch (error) {
    console.error('GET /api/logo error (using default logo):', error);
  }

  try {
    const data = await readFile(join(process.cwd(), 'public', 'logo.png'));
    return new NextResponse(new Uint8Array(data), { headers: { ...headers, 'Content-Type': 'image/png' } });
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }
}
