import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { CONTENT_TYPES, IMAGE_EXTENSIONS } from '@/lib/media';

// Serves the logo uploaded in the admin (public/uploads/site-logo.*),
// falling back to the default public/logo.png.
export async function GET() {
  const publicDir = join(process.cwd(), 'public');
  const candidates = [
    ...Array.from(new Set(Object.values(IMAGE_EXTENSIONS))).map((ext) => join(publicDir, 'uploads', `site-logo.${ext}`)),
    join(publicDir, 'logo.png'),
  ];

  for (const path of candidates) {
    try {
      const data = await readFile(path);
      const ext = path.split('.').pop() as string;
      return new NextResponse(new Uint8Array(data), {
        headers: {
          'Content-Type': CONTENT_TYPES[ext],
          'Cache-Control': 'public, max-age=0, must-revalidate',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    } catch {
      // try the next candidate
    }
  }
  return new NextResponse('Not found', { status: 404 });
}
