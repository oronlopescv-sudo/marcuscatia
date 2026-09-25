import { NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import { join, extname } from 'path';
import { CONTENT_TYPES } from '@/lib/media';

// `next start` only serves files that were in /public at build time, so files
// uploaded afterwards (see next.config.ts fallback rewrites) are served here.
const ALLOWED_DIRS = ['uploads', 'gallery', 'music'];

export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  if (!path?.length || !ALLOWED_DIRS.includes(path[0]) || path.some((p) => p === '..' || p.includes('/') || p.includes('\\'))) {
    return new NextResponse('Not found', { status: 404 });
  }

  const publicDir = join(process.cwd(), 'public');
  const filepath = join(publicDir, ...path);
  const contentType = CONTENT_TYPES[extname(filepath).slice(1).toLowerCase()];
  if (!contentType || !filepath.startsWith(join(publicDir, path[0]) + '/')) {
    return new NextResponse('Not found', { status: 404 });
  }

  try {
    const info = await stat(filepath);
    if (!info.isFile()) return new NextResponse('Not found', { status: 404 });
    const data = await readFile(filepath);
    return new NextResponse(new Uint8Array(data), {
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(info.size),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }
}
