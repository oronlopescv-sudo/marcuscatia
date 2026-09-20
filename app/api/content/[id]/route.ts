import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface ContentItem {
  title?: string;
  description?: string;
  content?: string;
  category?: string;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const data: ContentItem = await request.json();

    const now = new Date().toISOString();

    await query(
      `UPDATE site_content
       SET title = ?, description = ?, content = ?, category = ?, updatedAt = ?
       WHERE id = ?`,
      [
        data.title || null,
        data.description || null,
        data.content || null,
        data.category || null,
        now,
        id,
      ]
    );

    return NextResponse.json({ id, ...data, updatedAt: now });
  } catch (error) {
    console.error('Content PUT error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    await query('DELETE FROM site_content WHERE id = ?', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Content DELETE error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
