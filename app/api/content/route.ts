import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET - Listar conteúdo por seção
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const section = searchParams.get('section');

    if (section) {
      const results = await query(
        'SELECT * FROM site_content WHERE section = ? ORDER BY key_name',
        [section]
      );
      return NextResponse.json(results);
    }

    const results = await query('SELECT * FROM site_content ORDER BY section, key_name');
    return NextResponse.json(results);
  } catch (error: any) {
    console.error('GET /api/content error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Criar novo conteúdo
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, section, key_name, content, type } = body;

    if (!id || !section || !key_name || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO site_content (id, section, key_name, content, type)
       VALUES (?, ?, ?, ?, ?)`,
      [id, section, key_name, content, type || 'text']
    );

    return NextResponse.json({ success: true, result }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/content error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Atualizar conteúdo
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, content, type } = body;

    if (!id || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await query(
      `UPDATE site_content SET content = ?, type = ?, updated_at = NOW() WHERE id = ?`,
      [content, type || 'text', id]
    );

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('PUT /api/content error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Remover conteúdo
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const result = await query('DELETE FROM site_content WHERE id = ?', [id]);
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('DELETE /api/content error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
