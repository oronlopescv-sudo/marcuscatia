import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');

    let sql = 'SELECT id, name, rating, comment, createdAt FROM comments WHERE approved = 1';
    const params: any[] = [];

    if (courseId) {
      sql += ' AND courseId = ?';
      params.push(courseId);
    }

    sql += ' ORDER BY createdAt DESC LIMIT 50';

    const comments = await query(sql, params);
    return NextResponse.json({ comments }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch comments';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, rating, comment, courseId } = body;

    if (!name || !email || !rating || !comment) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be 1-5' }, { status: 400 });
    }

    const id = `comment-${Date.now()}`;

    await query(
      'INSERT INTO comments (id, name, email, rating, comment, courseId, approved) VALUES (?, ?, ?, ?, ?, ?, 0)',
      [id, name.trim(), email.trim(), rating, comment.trim(), courseId || null]
    );

    return NextResponse.json({
      success: true,
      id,
      message: 'Comment submitted for review'
    }, { status: 201 });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create comment';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Comment ID required' }, { status: 400 });
    }

    await query('DELETE FROM comments WHERE id = ?', [id]);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete comment';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
