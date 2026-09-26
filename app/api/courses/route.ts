import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { deleteMediaByUrl, isLostLocalUpload } from '@/lib/media';

// A coluna `includes` é guardada como JSON; devolve sempre array.
function parseIncludes(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => String(x));
  if (typeof v === 'string') {
    try {
      const p = JSON.parse(v);
      return Array.isArray(p) ? p.map((x) => String(x)) : [];
    } catch {
      return [];
    }
  }
  return [];
}

// GET — lista cursos. Aceita ?all=1 para incluir inativos (uso no admin).
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === '1';
    const sql = all
      ? 'SELECT * FROM courses ORDER BY title ASC'
      : 'SELECT * FROM courses WHERE active = 1 ORDER BY title ASC';
    const rows: any = await query(sql);
    const courses = (Array.isArray(rows) ? rows : []).map((c: any) => ({
      ...c,
      includes: parseIncludes(c.includes),
      active: !!c.active,
      // photos uploaded before media moved to MySQL were deleted by a deploy
      image: isLostLocalUpload(c.image) ? '' : c.image,
    }));
    return NextResponse.json({ courses }, { status: 200 });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, title, description, price, priceNumber, maxCapacity, level, duration, image, includes, timeSlot, active } = body;

    if (!id || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const activeVal = active === undefined ? 1 : active ? 1 : 0;

    await query(
      'INSERT INTO courses (id, title, description, price, priceNumber, maxCapacity, level, duration, image, timeSlot, includes, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, title, description || '', price ?? '', priceNumber || 0, maxCapacity || 8, level || 'Beginner', duration || '', image || '', timeSlot || '', JSON.stringify(includes || []), activeVal]
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

    // `includes` só é re-serializado quando veio no body (array). Se omitido
    // (ex.: toggle active), mantém o valor já guardado (string JSON) como está.
    const includesVal =
      includes !== undefined
        ? JSON.stringify(Array.isArray(includes) ? includes : parseIncludes(includes))
        : c.includes;

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
        includesVal,
        active === undefined ? c.active : (active ? 1 : 0),
        id,
      ]
    );

    // The photo was replaced or removed: drop the old one from the database.
    if (image !== undefined && image !== c.image) {
      await deleteMediaByUrl(c.image);
    }

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
    const rows: any = await query('SELECT image FROM courses WHERE id = ?', [id]);
    await query('DELETE FROM courses WHERE id = ?', [id]);
    await deleteMediaByUrl(rows?.[0]?.image);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 });
  }
}
