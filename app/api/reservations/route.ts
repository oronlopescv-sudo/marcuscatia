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
}) {
  try {
    // Send WhatsApp notification
    if (reservation.phone) {
      fetch('/api/notify/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: reservation.phone,
          courseTitle: reservation.courseTitle,
          date: reservation.date,
          time: reservation.time,
          guests: reservation.guests,
          totalPrice: reservation.totalPrice,
          studentName: reservation.studentName,
        }),
      }).catch(err => console.error('WhatsApp notification failed:', err));
    }

    // Create admin notification
    fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'reservation',
        title: `New Booking: ${reservation.studentName}`,
        description: `${reservation.courseTitle} on ${reservation.date} at ${reservation.time} for ${reservation.guests} guests`,
        data: reservation,
      }),
    }).catch(err => console.error('Admin notification failed:', err));

    // Send confirmation email
    fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: reservation.email,
        subject: '✅ Booking Confirmed - Cátia Cooking Mindelo',
        template: 'booking-confirmation',
        data: reservation,
      }),
    }).catch(err => console.error('Email notification failed:', err));
  } catch (error) {
    console.error('Notification sending error:', error);
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
    const { studentName, email, phone, courseId, courseTitle, date, time, guests, totalPrice, currency, notes, dietaryRestrictions } = body;

    if (!studentName || !email || !courseId || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const id = `res-${Date.now()}`;

    await query(
      'INSERT INTO reservations (id, studentName, email, phone, courseId, courseTitle, date, time, guests, totalPrice, currency, notes, dietaryRestrictions, status, paymentStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, "confirmed", "pending")',
      [id, studentName, email, phone || '', courseId, courseTitle, date, time || '', guests || 1, totalPrice || 0, currency || 'EUR', notes || '', dietaryRestrictions || '']
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
    });

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (error) {
    console.error('Error creating reservation:', error);
    return NextResponse.json({ error: 'Failed to create reservation' }, { status: 500 });
  }
}
