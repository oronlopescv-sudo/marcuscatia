import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const courses = await query('SELECT * FROM courses WHERE active = 1');
    return NextResponse.json({ courses }, { status: 200 });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, title, description, price, priceNumber, maxCapacity, level, duration, image, includes, timeSlot } = body;

    if (!id || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await query(
      'INSERT INTO courses (id, title, description, price, priceNumber, maxCapacity, level, duration, image, timeSlot, includes, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)',
      [id, title, description || '', price, priceNumber || 0, maxCapacity || 8, level || 'Beginner', duration || '', image || '', timeSlot || '', JSON.stringify(includes || [])]
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json({ error: 'Failed to create course' }, { status: 500 });
  }
}
