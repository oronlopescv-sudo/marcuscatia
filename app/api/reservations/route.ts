import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const reservations = await query('SELECT * FROM reservations ORDER BY createdAt DESC');
    return NextResponse.json({ reservations }, { status: 200 });
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json({ error: 'Failed to fetch reservations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentName, email, phone, courseId, courseTitle, date, time, guests, totalPrice, currency, notes, dietaryRestrictions } = body;

    if (!studentName || !email || !courseId || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const id = `res-${Date.now()}`;
    
    await query(
      'INSERT INTO reservations (id, studentName, email, phone, courseId, courseTitle, date, time, guests, totalPrice, currency, notes, dietaryRestrictions, status, paymentStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, "pending", "pending")',
      [id, studentName, email, phone || '', courseId, courseTitle, date, time || '', guests || 1, totalPrice || 0, currency || 'EUR', notes || '', dietaryRestrictions || '']
    );
    
    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (error) {
    console.error('Error creating reservation:', error);
    return NextResponse.json({ error: 'Failed to create reservation' }, { status: 500 });
  }
}
