import { NextResponse } from 'next/server';

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'u128759105_Marcuscatia',
  password: process.env.DB_PASSWORD || 'f5Zy*2M@',
  database: process.env.DB_NAME || 'u128759105_Catia',
};

// GET /api/blocked-dates - Fetch all blocked dates
export async function GET() {
  try {
    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection(DB_CONFIG);
    const [rows] = await connection.execute('SELECT date FROM blockedDates ORDER BY date ASC');
    await connection.end();
    const dates = (rows as any[]).map(row => row.date);
    return NextResponse.json({ blockedDates: dates }, { status: 200 });
  } catch (error) {
    console.error('Error fetching blocked dates:', error);
    return NextResponse.json({ error: 'Failed to fetch blocked dates' }, { status: 500 });
  }
}

// POST /api/blocked-dates - Block a date
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, reason } = body;

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection(DB_CONFIG);
    const id = `block-${Date.now()}`;
    
    await connection.execute(
      'INSERT INTO blockedDates (id, date, reason) VALUES (?, ?, ?)',
      [id, date, reason || '']
    );
    
    await connection.end();
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Error blocking date:', error);
    return NextResponse.json({ error: 'Failed to block date' }, { status: 500 });
  }
}

// DELETE /api/blocked-dates - Unblock a date
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { date } = body;

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection(DB_CONFIG);
    
    await connection.execute('DELETE FROM blockedDates WHERE date = ?', [date]);
    
    await connection.end();
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error unblocking date:', error);
    return NextResponse.json({ error: 'Failed to unblock date' }, { status: 500 });
  }
}
