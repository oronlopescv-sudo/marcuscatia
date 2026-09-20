import { NextResponse } from 'next/server';

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'u128759105_Marcuscatia',
  password: process.env.DB_PASSWORD || 'f5Zy*2M@',
  database: process.env.DB_NAME || 'u128759105_Catia',
};

// GET /api/messages - Fetch all messages
export async function GET() {
  try {
    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection(DB_CONFIG);
    const [rows] = await connection.execute('SELECT * FROM messages ORDER BY createdAt DESC');
    await connection.end();
    return NextResponse.json({ messages: rows }, { status: 200 });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// POST /api/messages - Create a new message
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection(DB_CONFIG);
    const id = `msg-${Date.now()}`;
    
    await connection.execute(
      `INSERT INTO messages (id, name, email, phone, subject, message, \`read\`) VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [id, name, email, phone || '', subject || '', message]
    );
    
    await connection.end();
    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
  }
}
