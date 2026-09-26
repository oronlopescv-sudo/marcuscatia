import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { MAX_AUDIO_BYTES, audioMimeType, deleteMediaByUrl, ensureMusicTable, isLostLocalUpload, saveMedia } from '@/lib/media';

type TrackRow = { id: number; title: string; url: string };

// GET - list music tracks
export async function GET() {
  try {
    await ensureMusicTable();
    const results = (await query('SELECT * FROM music_tracks ORDER BY created_at DESC')) as TrackRow[];
    const tracks = (Array.isArray(results) ? results : [])
      // tracks uploaded before media moved to MySQL were deleted by a deploy
      .filter((r) => !isLostLocalUpload(r.url))
      .map((r) => ({ id: String(r.id), title: r.title, url: r.url }));
    return NextResponse.json(tracks);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('GET /api/music error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST - upload a track (MP3/WAV/OGG/M4A/AAC/WebM), stored in MySQL
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const title = String(formData.get('title') ?? '').trim();

    if (!(file instanceof File) || !title) {
      return NextResponse.json({ error: 'File and title are required' }, { status: 400 });
    }

    const mime = audioMimeType(file);
    if (!mime) {
      return NextResponse.json(
        { error: 'Only MP3, WAV, OGG, M4A, AAC or WebM audio files are allowed' },
        { status: 400 }
      );
    }
    if (file.size > MAX_AUDIO_BYTES) {
      return NextResponse.json({ error: 'File cannot be larger than 25MB' }, { status: 400 });
    }

    await ensureMusicTable();
    const url = await saveMedia(Buffer.from(await file.arrayBuffer()), mime);
    try {
      const result = (await query('INSERT INTO music_tracks (title, url, created_at) VALUES (?, ?, NOW())', [title, url])) as { insertId: number };
      return NextResponse.json({ success: true, id: result?.insertId, title, url }, { status: 201 });
    } catch (error) {
      await deleteMediaByUrl(url);
      throw error;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('POST /api/music error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE - remove a track (?id=...)
export async function DELETE(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    await ensureMusicTable();
    const rows = (await query('SELECT url FROM music_tracks WHERE id = ?', [id])) as { url: string }[];
    await query('DELETE FROM music_tracks WHERE id = ?', [id]);
    await deleteMediaByUrl(rows[0]?.url);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('DELETE /api/music error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
