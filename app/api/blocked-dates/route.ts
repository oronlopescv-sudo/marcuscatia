import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const rows = await query('SELECT date FROM blockedDates ORDER BY date ASC');
    const blockedDates = (rows as any[]).map(row => row.date);
    return NextResponse.json({ blockedDates }, { status: 200 });
  } catch (error) {
    console.error('Error fetching blocked dates:', error);
    return NextResponse.json({ error: 'Failed to fetch blocked dates' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, reason } = body;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: 'Date is required (YYYY-MM-DD)' }, { status: 400 });
    }

    const id = `block-${Date.now()}`;
    
    await query(
      'INSERT IGNORE INTO blockedDates (id, date, reason) VALUES (?, ?, ?)',
      [id, date, reason || '']
    );
    
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Error blocking date:', error);
    return NextResponse.json({ error: 'Failed to block date' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { date } = body;

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    await query('DELETE FROM blockedDates WHERE date = ?', [date]);
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error unblocking date:', error);
    return NextResponse.json({ error: 'Failed to unblock date' }, { status: 500 });
  }
}
