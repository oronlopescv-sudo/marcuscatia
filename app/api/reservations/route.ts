import { NextResponse } from 'next/server';

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'u128759105_Marcuscatia',
  password: process.env.DB_PASSWORD || 'f5Zy*2M@',
  database: process.env.DB_NAME || 'u128759105_Catia',
};

// GET /api/reservations - Fetch all reservations
export async function GET() {
  try {
    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection(DB_CONFIG);
    const [rows] = await connection.execute('SELECT * FROM reservations ORDER BY createdAt DESC');
    await connection.end();
    return NextResponse.json({ reservations: rows }, { status: 200 });
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json({ error: 'Failed to fetch reservations' }, { status: 500 });
  }
}

// POST /api/reservations - Create a new reservation
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      studentName, email, phone, courseId, courseTitle, date, 
      time, guests, totalPrice, currency, notes, dietaryRestrictions 
    } = body;

    if (!studentName || !email || !courseId || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection(DB_CONFIG);
    const id = `res-${Date.now()}`;
    
    await connection.execute(
      `INSERT INTO reservations 
       (id, studentName, email, phone, courseId, courseTitle, date, time, guests, totalPrice, currency, notes, dietaryRestrictions, status, paymentStatus) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending')`,
      [id, studentName, email, phone || '', courseId, courseTitle, date, time || '', guests || 1, totalPrice || 0, currency || 'EUR', notes || '', dietaryRestrictions || '']
    );
    
    await connection.end();
    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (error) {
    console.error('Error creating reservation:', error);
    return NextResponse.json({ error: 'Failed to create reservation' }, { status: 500 });
  }
}
