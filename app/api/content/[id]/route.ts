import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface ContentUpdate {
  section?: string;
  key_name?: string;
  content?: string;
  type?: string;
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const data: ContentUpdate = await request.json();

    await query(
      `UPDATE site_content
       SET section = ?, key_name = ?, content = ?, type = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        data.section || null,
        data.key_name || null,
        data.content || null,
        data.type || 'text',
        id,
      ]
    );

    return NextResponse.json({ id, ...data });
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
