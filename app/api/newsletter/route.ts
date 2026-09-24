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
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
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
