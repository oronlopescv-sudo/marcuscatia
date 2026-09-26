import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ensureMediaTable } from '@/lib/media';

type MediaRow = { mime: string; size: number; chunk: Buffer };

// Serves a photo/logo/track stored in MySQL. Supports Range requests, which
// iOS Safari needs to play audio.
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!/^[a-f0-9]{24}$/.test(id)) {
    return new NextResponse('Not found', { status: 404 });
  }

  try {
    await ensureMediaTable();
    const meta = (await query('SELECT mime, size FROM media_files WHERE id = ?', [id])) as { mime: string; size: number }[];
    if (!meta?.length) return new NextResponse('Not found', { status: 404 });
    const { mime } = meta[0];
    const size = Number(meta[0].size);

    const headers: Record<string, string> = {
      'Content-Type': mime,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    };

    const range = request.headers.get('range')?.match(/^bytes=(\d*)-(\d*)$/);
    if (range && (range[1] || range[2])) {
      let start = range[1] ? Number(range[1]) : size - Number(range[2]);
      let end = range[1] && range[2] ? Number(range[2]) : size - 1;
      start = Math.max(0, start);
      end = Math.min(end, size - 1);
      if (start > end || start >= size) {
        return new NextResponse(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
      }
      const rows = (await query('SELECT SUBSTRING(data, ?, ?) AS chunk FROM media_files WHERE id = ?', [start + 1, end - start + 1, id])) as MediaRow[];
      const chunk = rows[0].chunk;
      return new NextResponse(new Uint8Array(chunk), {
        status: 206,
        headers: { ...headers, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': String(chunk.length) },
      });
    }

    const rows = (await query('SELECT data AS chunk FROM media_files WHERE id = ?', [id])) as MediaRow[];
    const data = rows[0].chunk;
    return new NextResponse(new Uint8Array(data), { headers: { ...headers, 'Content-Length': String(data.length) } });
  } catch (error) {
    console.error('GET /api/media error:', error);
    return new NextResponse('Error', { status: 500 });
  }
}
