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
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const data: ContentItem = await request.json();

    const now = new Date().toISOString();

    await query(
      `UPDATE site_content
       SET title = ?, description = ?, content = ?, category = ?, updated_at = ?
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

    return NextResponse.json({ id, ...data, updated_at: now });
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
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

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
