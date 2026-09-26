import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { IMAGE_TYPES, MAX_IMAGE_BYTES, deleteMediaByUrl, isLostLocalUpload, saveMedia } from '@/lib/media';

// GET - Listar todos os items da galeria
export async function GET(req: NextRequest) {
  try {
    const results = (await query('SELECT * FROM gallery_items ORDER BY created_at DESC')) as { type: string; src: string }[];
    // Photos uploaded before media moved to MySQL were deleted by a deploy.
    return NextResponse.json(results.filter((item) => item.type === 'video' || !isLostLocalUpload(item.src)));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST - Adicionar novo item à galeria (upload de ficheiro)
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const title = formData.get('title') as string;
    const category = formData.get('category') as string;
    const youtubeId = formData.get('youtubeId') as string;

    // Validate file or YouTube
    if (!(file instanceof File) && !youtubeId) {
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

    if (youtubeId && !/^[A-Za-z0-9_-]{6,20}$/.test(youtubeId)) {
      return NextResponse.json({ error: 'Invalid YouTube ID' }, { status: 400 });
    }

    // YouTube video
    if (youtubeId) {
      src = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
      type = 'video';
    }
    // Photo upload (stored in MySQL)
    else if (file instanceof File) {
      if (!IMAGE_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: 'Only JPEG, PNG, WebP and GIF are allowed' },
          { status: 400 }
        );
      }
      if (file.size > MAX_IMAGE_BYTES) {
        return NextResponse.json(
          { error: 'File cannot be larger than 10MB' },
          { status: 400 }
        );
      }
      src = await saveMedia(Buffer.from(await file.arrayBuffer()), file.type);
      type = 'photo';
    }

    // Save to DB (and don't leave an orphaned photo if that fails)
    let result;
    try {
      result = await query(
        `INSERT INTO gallery_items (src, title, category, type, youtubeId, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [src, title, category, type, youtubeId || null]
      );
    } catch (error) {
      if (type === 'photo') await deleteMediaByUrl(src);
      throw error;
    }

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

// PATCH - Editar item existente (title, category, type, youtubeId)
export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const body = await req.json();
    const { title, category, type, youtubeId } = body ?? {};

    const fields: string[] = [];
    const values: (string | number | boolean | null)[] = [];

    if (typeof title === 'string') {
      fields.push('title = ?');
      values.push(title.trim());
    }
    if (typeof category === 'string') {
      fields.push('category = ?');
      values.push(category.trim());
    }
    if (type === 'photo' || type === 'video') {
      fields.push('type = ?');
      values.push(type);
    }
    if (typeof youtubeId === 'string' && type === 'video') {
      if (!/^[A-Za-z0-9_-]{6,20}$/.test(youtubeId)) {
        return NextResponse.json({ error: 'Invalid YouTube ID' }, { status: 400 });
      }
      fields.push('youtubeId = ?');
      fields.push('src = ?');
      values.push(youtubeId);
      values.push(`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`);
    }

    if (fields.length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    values.push(id);
    await query(`UPDATE gallery_items SET ${fields.join(', ')} WHERE id = ?`, values);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('PATCH /api/gallery error:', message);
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

    const rows = (await query('SELECT src, type FROM gallery_items WHERE id = ?', [id])) as { src: string; type: string }[];
    await query('DELETE FROM gallery_items WHERE id = ?', [id]);
    if (rows[0]?.type === 'photo') await deleteMediaByUrl(rows[0].src);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
