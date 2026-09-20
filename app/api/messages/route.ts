import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const messages = await query('SELECT * FROM messages ORDER BY createdAt DESC');
    return NextResponse.json({ messages }, { status: 200 });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const id = `msg-${Date.now()}`;
    
    await query(
      'INSERT INTO messages (id, name, email, phone, subject, message, `read`) VALUES (?, ?, ?, ?, ?, ?, 0)',
      [id, name, email, phone || '', subject || '', message]
    );
    
    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
  }
}
