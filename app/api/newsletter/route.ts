import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

async function ensureTable() {
  await query(
    `CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id VARCHAR(255) PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email || typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const trimmed = email.trim().toLowerCase();
    await ensureTable();

    const id = `nl-${Date.now()}`;
    await query(
      'INSERT IGNORE INTO newsletter_subscribers (id, email) VALUES (?, ?)',
      [id, trimmed]
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}

// GET — list subscribers (admin only, enforced by middleware)
export async function GET() {
  try {
    await ensureTable();
    const subscribers = await query('SELECT id, email, created_at FROM newsletter_subscribers ORDER BY created_at DESC');
    return NextResponse.json({ subscribers });
  } catch (error) {
    console.error('Error listing newsletter subscribers:', error);
    return NextResponse.json({ error: 'Failed to list subscribers' }, { status: 500 });
  }
}

// DELETE — remove a subscriber (?id=...)
export async function DELETE(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }
    await query('DELETE FROM newsletter_subscribers WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting newsletter subscriber:', error);
    return NextResponse.json({ error: 'Failed to delete subscriber' }, { status: 500 });
  }
}
