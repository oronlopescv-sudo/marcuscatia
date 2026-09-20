import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface Notification {
  id?: string;
  type: 'reservation' | 'message' | 'comment' | 'system';
  title: string;
  description?: string;
  data?: Record<string, unknown>;
  read?: boolean;
  createdAt?: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit') || '50';
    const unreadOnly = searchParams.get('unread') === 'true';

    let sql = 'SELECT * FROM notifications';
    const params: unknown[] = [];

    if (unreadOnly) {
      sql += ' WHERE `read` = false';
    }

    sql += ' ORDER BY createdAt DESC LIMIT ?';
    params.push(parseInt(limit));

    const results = await query(sql, params);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Notifications GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: Notification = await request.json();

    if (!data.type || !data.title) {
      return NextResponse.json(
        { error: 'Type and title required' },
        { status: 400 }
      );
    }

    const id = `notif-${Date.now()}`;
    const now = new Date().toISOString();
    const dataJson = JSON.stringify(data.data || {});

    await query(
      `INSERT INTO notifications (id, type, title, description, data, \`read\`, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, data.type, data.title, data.description || null, dataJson, false, now]
    );

    return NextResponse.json({ id, ...data, read: false, createdAt: now });
  } catch (error) {
    console.error('Notifications POST error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
