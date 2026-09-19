import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET - Listar todos os items da galeria
export async function GET(req: NextRequest) {
  try {
    const results = await query(
      'SELECT * FROM gallery_items ORDER BY created_at DESC'
    );
    return NextResponse.json(results);
  } catch (error: any) {
    console.error('GET /api/gallery error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Adicionar novo item à galeria
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { src, title, category, type, youtubeId } = body;

    if (!src || !title || !category || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO gallery_items (src, title, category, type, youtubeId, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [src, title, category, type, youtubeId || null]
    );

    return NextResponse.json({ success: true, result }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/gallery error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
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
  } catch (error: any) {
    console.error('DELETE /api/gallery error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
