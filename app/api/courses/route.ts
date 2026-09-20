import { NextResponse } from 'next/server';

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'u128759105_Marcuscatia',
  password: process.env.DB_PASSWORD || 'f5Zy*2M@',
  database: process.env.DB_NAME || 'u128759105_Catia',
};

// GET /api/courses - Fetch all courses from database
export async function GET() {
  try {
    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection(DB_CONFIG);
    const [rows] = await connection.execute('SELECT * FROM courses WHERE active = 1');
    await connection.end();
    return NextResponse.json({ courses: rows }, { status: 200 });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}

// POST /api/courses - Create a new course (admin only)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, title, description, price, priceNumber, maxCapacity, level, duration, image, includes, timeSlot } = body;

    if (!id || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection(DB_CONFIG);

    await connection.execute(
      'INSERT INTO courses (id, title, description, price, priceNumber, maxCapacity, level, duration, image, timeSlot, includes, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)',
      [id, title, description || '', price, priceNumber || 0, maxCapacity || 8, level || 'Beginner', duration || '', image || '', timeSlot || '', JSON.stringify(includes || [])]
    );

    await connection.end();
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json({ error: 'Failed to create course' }, { status: 500 });
  }
}
