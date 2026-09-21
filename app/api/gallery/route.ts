import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// GET - Listar todos os items da galeria
export async function GET(req: NextRequest) {
  try {
    const results = await query(
      'SELECT * FROM gallery_items ORDER BY created_at DESC'
    );
    return NextResponse.json(results);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST - Adicionar novo item à galeria (upload de ficheiro)
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const category = formData.get('category') as string;
    const youtubeId = formData.get('youtubeId') as string;

    // Validate file or YouTube
    if (!file && !youtubeId) {
      return NextResponse.json(
        { error: 'Please provide a photo or a YouTube ID' },
        { status: 400 }
      );
    }

    if (!title || !category) {
      return NextResponse.json(
        { error: 'Title and category are required' },
        { status: 400 }
      );
    }

    let src = '';
    let type = 'photo';

    // YouTube video
    if (youtubeId) {
      src = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
      type = 'video';
    }
    // Photo upload
    else if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: 'Only JPEG, PNG and WebP are allowed' },
          { status: 400 }
        );
      }

      // Validate size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'File cannot be larger than 10MB' },
          { status: 400 }
        );
      }

      // Save file
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Create directory if it doesn't exist
      const uploadDir = join(process.cwd(), 'public', 'gallery');
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const ext = file.name.split('.').pop() || 'jpg';
      const filename = `${timestamp}-${Math.random().toString(36).substr(2, 9)}.${ext}`;
      const filepath = join(uploadDir, filename);

      // Save file to disk
      await writeFile(filepath, buffer);

      src = `/gallery/${filename}`;
      type = 'photo';
    }

    // Save to DB
    const result = await query(
      `INSERT INTO gallery_items (src, title, category, type, youtubeId, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [src, title, category, type, youtubeId || null]
    );

    return NextResponse.json(
      { success: true, src, id: result.insertId },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('POST /api/gallery error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE - Remover item da galeria
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const result = await query('DELETE FROM gallery_items WHERE id = ?', [id]);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
