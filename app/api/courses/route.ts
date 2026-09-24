import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET — lista cursos. Aceita ?all=1 para incluir inativos (uso no admin).
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === '1';
    const sql = all
      ? 'SELECT * FROM courses ORDER BY title ASC'
      : 'SELECT * FROM courses WHERE active = 1 ORDER BY title ASC';
    const courses = await query(sql);
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

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, title, description, price, priceNumber, maxCapacity, level, duration, image, timeSlot, includes, active } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing course id' }, { status: 400 });
    }

    const existing: any = await query('SELECT * FROM courses WHERE id = ?', [id]);
    if (!existing || existing.length === 0) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    const c = existing[0];

    await query(
      `UPDATE courses SET
        title = ?, description = ?, price = ?, priceNumber = ?,
        maxCapacity = ?, level = ?, duration = ?, image = ?, timeSlot = ?,
        includes = ?, active = ?
       WHERE id = ?`,
      [
        title ?? c.title,
        description ?? c.description,
        price ?? c.price,
        priceNumber ?? c.priceNumber,
        maxCapacity ?? c.maxCapacity,
        level ?? c.level,
        duration ?? c.duration,
        image ?? c.image,
        timeSlot ?? c.timeSlot,
        JSON.stringify(includes ?? (c.includes || [])),
        active === undefined ? c.active : (active ? 1 : 0),
        id,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json({ error: 'Failed to update course' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing course id' }, { status: 400 });
    }
    await query('DELETE FROM courses WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 });
  }
}
