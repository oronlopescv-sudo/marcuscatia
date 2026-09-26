import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { query } from '@/lib/db';
import { isAdminRequest } from '@/lib/auth';
import { esc, resolveNotifyEmail, sendEmail } from '@/lib/email';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// GET — approved reviews for the public site; ?all=1 (admin) includes pending ones.
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');
    const all = searchParams.get('all') === '1' && (await isAdminRequest(req));

    let sql = all
      ? 'SELECT id, name, email, rating, comment, courseId, approved, createdAt FROM comments WHERE 1 = 1'
      : 'SELECT id, name, rating, comment, createdAt FROM comments WHERE approved = 1';
    const params: string[] = [];

    if (courseId) {
      sql += ' AND courseId = ?';
      params.push(courseId);
    }

    sql += all ? ' ORDER BY approved ASC, createdAt DESC LIMIT 200' : ' ORDER BY createdAt DESC LIMIT 50';

    const comments = await query(sql, params);
    return NextResponse.json({ comments }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch comments';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST — a visitor leaves a review; it waits for the admin's approval.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const comment = typeof body.comment === 'string' ? body.comment.trim() : '';
    const rating = Math.round(Number(body.rating));

    if (!name || !email || !comment || !rating) {
      return NextResponse.json({ error: 'Please fill in your name, email, rating and review' }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be 1-5' }, { status: 400 });
    }
    if (name.length > 100 || comment.length > 2000) {
      return NextResponse.json({ error: 'Review is too long' }, { status: 400 });
    }

    const id = `comment-${Date.now()}-${randomBytes(3).toString('hex')}`;
    await query(
      'INSERT INTO comments (id, name, email, rating, comment, courseId, approved) VALUES (?, ?, ?, ?, ?, ?, 0)',
      [id, name, email, rating, comment, typeof body.courseId === 'string' ? body.courseId : null]
    );

    resolveNotifyEmail()
      .then((to) => {
        if (!to) return;
        return sendEmail(
          to,
          `Nova avaliação (${rating}★) de ${name}`,
          `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#222;">
            <h2 style="color:#0A3D78;">Nova avaliação à espera de aprovação</h2>
            <p><strong>${esc(name)}</strong> (${esc(email)}) — ${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}</p>
            <p>${esc(comment)}</p>
            <p style="color:#666;">Aprove ou apague em Admin → Content → Guest Reviews.</p>
          </div>`
        );
      })
      .catch((err) => console.error('Review notify failed:', err));

    return NextResponse.json({ success: true, id, message: 'Review submitted for approval' }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create comment';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH — approve or hide a review (admin only, enforced by middleware)
export async function PATCH(request: NextRequest) {
  try {
    const { id, approved } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Comment ID required' }, { status: 400 });
    }
    await query('UPDATE comments SET approved = ? WHERE id = ?', [approved ? 1 : 0, id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update comment';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE — remove a review (admin only, enforced by middleware)
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
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
