import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendWhatsAppBookingConfirmation } from '@/lib/whatsapp';

// ---------------------------------------------------------------
// Email (Resend) — helper único
// ---------------------------------------------------------------
async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log('📧 Email not sent (RESEND_API_KEY not set):', subject, '->', to);
    return;
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.NOTIFY_FROM_EMAIL || 'Catia Cooking <onboarding@resend.dev>',
        to,
        subject,
        html,
      }),
    });
    if (!res.ok) {
      const errBody = await res.text();
      console.error('Resend API error:', res.status, errBody);
    }
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

function esc(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

type ResData = {
  studentName: string;
  email: string;
  phone: string;
  courseTitle: string;
  date: string;
  time: string;
  guests: number;
  totalPrice: number;
  currency: string;
};

function detailsHtml(r: ResData, extra = '') {
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#222;">
      <h2 style="color:#0A3D78;">${esc(r.courseTitle)}</h2>
      <p><strong>Nome:</strong> ${esc(r.studentName)}</p>
      <p><strong>Email:</strong> ${esc(r.email)}</p>
      <p><strong>WhatsApp:</strong> ${esc(r.phone)}</p>
      <p><strong>Data:</strong> ${esc(r.date)}</p>
      <p><strong>Horário:</strong> ${esc(r.time)}</p>
      <p><strong>Convidados:</strong> ${r.guests}</p>
      <p><strong>Total:</strong> ${r.totalPrice} ${esc(r.currency)}</p>
      ${extra}
    </div>`;
}

// Notifica o admin sobre uma nova reserva
function notifyAdmin(r: ResData) {
  const notifyEmail = process.env.NOTIFY_EMAIL;
  if (!notifyEmail) {
    console.log('📧 Nova reserva (NOTIFY_EMAIL não configurado):', r.studentName);
    return;
  }
  sendEmail(
    notifyEmail,
    `Nova Reserva: ${r.studentName} - ${r.date}`,
    detailsHtml(r, `<p style="margin-top:16px;color:#666;">Aceda ao painel admin para confirmar ou recusar esta reserva.</p>`)
  );
}

// Email que o cliente recebe logo ao fazer a reserva (aviso de que foi recebida)
function confirmToCustomer(r: ResData) {
  sendEmail(
    r.email,
    `Reserva recebida - ${r.courseTitle}`,
    detailsHtml(r, `<p style="margin-top:16px;background:#f3f4f6;padding:12px;border-radius:8px;">Recebemos a sua reserva! Obrigado. Entraremos em contacto por WhatsApp para confirmar. Fica registada com o estado <strong>pendente</strong> até confirmação.</p>`)
  );
}

// Email que o cliente recebe quando o admin confirma a reserva
function approveToCustomer(r: ResData) {
  sendEmail(
    r.email,
    `✔ Reserva confirmada - ${r.courseTitle}`,
    detailsHtml(r, `<p style="margin-top:16px;background:#ecfdf5;padding:12px;border-radius:8px;"><strong>A sua reserva foi confirmada!</strong> Esperamos por si em ${esc(r.date)} às ${esc(r.time)}.</p>`)
  );
}

// ---------------------------------------------------------------
// GET — listar reservas
// ---------------------------------------------------------------
export async function GET() {
  try {
    const reservations = await query('SELECT * FROM reservations ORDER BY createdAt DESC');
    return NextResponse.json({ reservations }, { status: 200 });
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json({ error: 'Failed to fetch reservations' }, { status: 500 });
  }
}

// ---------------------------------------------------------------
// POST — criar reserva (cliente). Avisa o admin e confirma ao cliente.
// ---------------------------------------------------------------
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentName, email, phone, courseId, courseTitle, date, time, guests, totalPrice, currency, notes, dietaryRestrictions, status, paymentStatus } = body;

    if (!studentName || !email || !courseId || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const id = `res-${Date.now()}`;

    await query(
      'INSERT INTO reservations (id, studentName, email, phone, courseId, courseTitle, date, time, guests, totalPrice, currency, notes, dietaryRestrictions, status, paymentStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, studentName, email, phone || '', courseId, courseTitle, date, time || '', guests || 1, totalPrice || 0, currency || 'EUR', notes || '', dietaryRestrictions || '', status || 'pending', paymentStatus || 'pending']
    );

    const resData: ResData = {
      studentName, email, phone: phone || '', courseTitle,
      date, time: time || '', guests: guests || 1, totalPrice: totalPrice || 0, currency: currency || 'EUR',
    };

    notifyAdmin(resData);
    confirmToCustomer(resData);

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (error) {
    console.error('Error creating reservation:', error);
    return NextResponse.json({ error: 'Failed to create reservation' }, { status: 500 });
  }
}

// ---------------------------------------------------------------
// PATCH — atualizar reserva (admin: status/pagamento). Emite email de
// confirmação ao cliente quando a reserva passa a "confirmed".
// ---------------------------------------------------------------
export async function PATCH(request: Request) {
  try {
    const { id, status, paymentStatus } = await request.json();
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Missing reservation id' }, { status: 400 });
    }

    const rows: any = await query('SELECT * FROM reservations WHERE id = ?', [id]);
    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }
    const r = rows[0];

    const newStatus = status ?? r.status;
    const newPayment = paymentStatus ?? r.paymentStatus;

    await query('UPDATE reservations SET status = ?, paymentStatus = ? WHERE id = ?', [newStatus, newPayment, id]);

    const wasConfirmed = r.status === 'confirmed' || r.status === 'confirmada';
    const nowConfirmed = newStatus === 'confirmed' || newStatus === 'confirmada';
    if (nowConfirmed && !wasConfirmed) {
      approveToCustomer({
        studentName: r.studentName, email: r.email, phone: r.phone || '',
        courseTitle: r.courseTitle, date: r.date, time: r.time || '',
        guests: r.guests || 1, totalPrice: Number(r.totalPrice) || 0, currency: r.currency || 'EUR',
      });

      // Confirmação também por WhatsApp (envia só se as credenciais existirem;
      // sem credenciais retorna configured:false e não faz nada).
      if (r.phone) {
        sendWhatsAppBookingConfirmation({
          phoneNumber: r.phone,
          studentName: r.studentName,
          courseTitle: r.courseTitle,
          date: r.date,
          time: r.time || '',
          guests: r.guests || 1,
          totalPrice: Number(r.totalPrice) || 0,
        }).catch((err) => console.error('WhatsApp notify failed:', err));
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating reservation:', error);
    return NextResponse.json({ error: 'Failed to update reservation' }, { status: 500 });
  }
}

// ---------------------------------------------------------------
// DELETE — remover reserva
// ---------------------------------------------------------------
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Missing reservation id' }, { status: 400 });
    }
    await query('DELETE FROM reservations WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting reservation:', error);
    return NextResponse.json({ error: 'Failed to delete reservation' }, { status: 500 });
  }
}
