import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

async function sendNotifications(reservation: {
  studentName: string;
  email: string;
  phone: string;
  courseTitle: string;
  date: string;
  time: string;
  guests: number;
  totalPrice: number;
  currency: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const notifyEmail = process.env.NOTIFY_EMAIL;

  if (!apiKey || !notifyEmail) {
    console.log('📧 New reservation (email not configured - set RESEND_API_KEY and NOTIFY_EMAIL):', {
      student: reservation.studentName,
      email: reservation.email,
      phone: reservation.phone,
      course: reservation.courseTitle,
      date: reservation.date,
    });
    return;
  }

  try {
    const html = `
      <h2>Nova Reserva - ${reservation.courseTitle}</h2>
      <p><strong>Nome:</strong> ${reservation.studentName}</p>
      <p><strong>Email:</strong> ${reservation.email}</p>
      <p><strong>WhatsApp:</strong> ${reservation.phone}</p>
      <p><strong>Data:</strong> ${reservation.date}</p>
      <p><strong>Horário:</strong> ${reservation.time}</p>
      <p><strong>Convidados:</strong> ${reservation.guests}</p>
      <p><strong>Total:</strong> ${reservation.totalPrice} ${reservation.currency}</p>
      <p style="margin-top:16px;">Aceda ao painel admin para confirmar ou recusar esta reserva.</p>
    `;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.NOTIFY_FROM_EMAIL || 'Catia Cooking <onboarding@resend.dev>',
        to: [notifyEmail],
        subject: `Nova Reserva: ${reservation.studentName} - ${reservation.date}`,
        html,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error('Resend API error:', res.status, errBody);
    }
  } catch (error) {
    console.error('Error sending reservation email:', error);
  }
}

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
    const { studentName, email, phone, courseId, courseTitle, date, time, guests, totalPrice, currency, notes, dietaryRestrictions, status, paymentStatus } = body;

    if (!studentName || !email || !courseId || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const id = `res-${Date.now()}`;

    // FIX: status/paymentStatus were previously hardcoded to
    // "confirmed"/"pending" here, ignoring what the booking form actually
    // sends (new bookings arrive as status="pending" so the admin can
    // review and confirm them - see app/courses/[id]/page.tsx). Now uses
    // the real values, falling back to sensible defaults if missing.
    await query(
      'INSERT INTO reservations (id, studentName, email, phone, courseId, courseTitle, date, time, guests, totalPrice, currency, notes, dietaryRestrictions, status, paymentStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, studentName, email, phone || '', courseId, courseTitle, date, time || '', guests || 1, totalPrice || 0, currency || 'EUR', notes || '', dietaryRestrictions || '', status || 'pending', paymentStatus || 'pending']
    );

    // Send notifications asynchronously
    sendNotifications({
      studentName,
      email,
      phone: phone || '',
      courseTitle,
      date,
      time: time || '',
      guests: guests || 1,
      totalPrice: totalPrice || 0,
      currency: currency || 'EUR',
    });

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (error) {
    console.error('Error creating reservation:', error);
    return NextResponse.json({ error: 'Failed to create reservation' }, { status: 500 });
  }
}
