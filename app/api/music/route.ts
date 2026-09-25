import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// GET - Listar faixas de música
export async function GET() {
  try {
    const results: any = await query(
      'SELECT * FROM music_tracks ORDER BY created_at DESC'
    );
    const tracks = (Array.isArray(results) ? results : []).map((r: any) => ({
      id: String(r.id),
      title: r.title,
      url: r.url,
    }));
    return NextResponse.json(tracks);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('GET /api/music error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST - Fazer upload de uma faixa de música (MP3/WAV/OGG/M4A)
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const title = String(formData.get('title') ?? '').trim();

    if (!file || !title) {
      return NextResponse.json(
        { error: 'File and title are required' },
        { status: 400 }
      );
    }

    // Validar tipo de áudio
    const name = file.name.toLowerCase();
    const allowedTypes = [
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/x-wav',
      'audio/ogg',
      'audio/mp4',
      'audio/aac',
      'audio/x-m4a',
      'audio/webm',
    ];
    const hasAllowedExt = /\.(mp3|wav|ogg|m4a|aac|webm)$/.test(name);
    if (!allowedTypes.includes(file.type) && !hasAllowedExt) {
      return NextResponse.json(
        { error: 'Only MP3, WAV, OGG, M4A, AAC or WebM audio files are allowed' },
        { status: 400 }
      );
    }

    // Máx 20MB
    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File cannot be larger than 20MB' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = join(process.cwd(), 'public', 'music');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const timestamp = Date.now();
    const ext = name.split('.').pop() || 'mp3';
    const filename = `${timestamp}-${Math.random().toString(36).substr(2, 9)}.${ext}`;
    const filepath = join(uploadDir, filename);

    await writeFile(filepath, buffer);

    const url = `/music/${filename}`;
    const result: any = await query(
      'INSERT INTO music_tracks (title, url, created_at) VALUES (?, ?, NOW())',
      [title, url]
    );

    return NextResponse.json(
      { success: true, id: result?.insertId, title, url },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('POST /api/music error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE - Remover faixa de música (?id=...)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    await query('DELETE FROM music_tracks WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('DELETE /api/music error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
