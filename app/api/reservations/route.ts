import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET - Listar todas as reservas
export async function GET(req: NextRequest) {
  try {
    const results = await query(
      'SELECT * FROM reservations ORDER BY date DESC, id DESC'
    );
    return NextResponse.json(results);
  } catch (error: any) {
    console.error('GET /api/reservations error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Criar nova reserva
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      studentName,
      email,
      phone,
      courseId,
      courseTitle,
      date,
      time,
      guests,
      totalPrice,
      currency,
      status,
      paymentStatus,
      notes,
      dietaryRestrictions,
    } = body;

    const result = await query(
      `INSERT INTO reservations (
        studentName, email, phone, courseId, courseTitle, date, time, guests,
        totalPrice, currency, status, paymentStatus, notes, dietaryRestrictions
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        studentName,
        email,
        phone,
        courseId,
        courseTitle,
        date,
        time,
        guests,
        totalPrice,
        currency,
        status,
        paymentStatus,
        notes,
        dietaryRestrictions,
      ]
    );

    return NextResponse.json({ success: true, result }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/reservations error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
