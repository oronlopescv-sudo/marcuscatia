import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSetting } from '@/lib/settings';
import { sendWhatsAppBookingConfirmation, sendWhatsAppNewReservation } from '@/lib/whatsapp';
import { sendEmail, esc } from '@/lib/email';
import { isAdminRequest } from '@/lib/auth';
import { randomBytes } from 'crypto';
import { RESTAURANT_DINNER, RESTAURANT_MIN_GUESTS, isRestaurantBooking, parseTimeSlots } from '@/lib/restaurant';
import { clientIp, isRateLimited } from '@/lib/rateLimit';

// An early schema had reservations.courseId REFERENCES courses(id). The
// restaurant dinner books with courseId='restaurant-dinner', a virtual
// course that intentionally never has a row in `courses` (see
// lib/restaurant.ts), so that constraint made every dinner booking fail
// with a foreign key error ("Failed to create reservation"). Self-heals the
// live database once per server start, the same way lib/media.ts's
// ensureMediaTable() adds tables it needs.
let fkCheckDone = false;
async function ensureNoLegacyCourseFk() {
  if (fkCheckDone) return;
  fkCheckDone = true;
  try {
    const fk = (await query(
      `SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'reservations'
         AND COLUMN_NAME = 'courseId' AND REFERENCED_TABLE_NAME = 'courses'
       LIMIT 1`
    )) as { CONSTRAINT_NAME: string }[];
    if (fk?.[0]?.CONSTRAINT_NAME) {
      await query(`ALTER TABLE reservations DROP FOREIGN KEY \`${fk[0].CONSTRAINT_NAME}\``);
      console.log('Removed legacy FK reservations.courseId -> courses.id');
    }
  } catch (error) {
    // Don't block bookings if this check itself fails; just retry next call.
    fkCheckDone = false;
    console.error('ensureNoLegacyCourseFk failed:', error);
  }
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

const LABELS = {
  pt: { name: 'Nome', date: 'Data', time: 'Horário', guests: 'Convidados' },
  en: { name: 'Name', date: 'Date', time: 'Time', guests: 'Guests' },
};

function detailsHtml(r: ResData, extra = '', lang: 'pt' | 'en' = 'pt') {
  const L = LABELS[lang];
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#222;">
      <h2 style="color:#0A3D78;">${esc(r.courseTitle)}</h2>
      <p><strong>${L.name}:</strong> ${esc(r.studentName)}</p>
      <p><strong>Email:</strong> ${esc(r.email)}</p>
      <p><strong>WhatsApp:</strong> ${esc(r.phone)}</p>
      <p><strong>${L.date}:</strong> ${esc(r.date)}</p>
      <p><strong>${L.time}:</strong> ${esc(r.time)}</p>
      <p><strong>${L.guests}:</strong> ${esc(r.guests)}</p>
      <p><strong>Total:</strong> ${esc(r.totalPrice)} ${esc(r.currency)}</p>
      ${extra}
    </div>`;
}

// Notifica o admin sobre uma nova reserva. Prioriza o email definido pelo
// admin em Settings (notify_email); senão usa NOTIFY_EMAIL da env.
async function notifyAdmin(r: ResData) {
  let notifyEmail = process.env.NOTIFY_EMAIL || '';
  try {
    const stored = await getSetting('notify_email');
    if (stored) notifyEmail = stored;
  } catch (e) {
    console.error('Error reading notify_email setting:', e);
  }

  if (!notifyEmail) {
    console.log('📧 Nova reserva (email do admin não configurado):', r.studentName);
    return;
  }
  await sendEmail(
    notifyEmail,
    `Nova Reserva: ${r.studentName} - ${r.date}`,
    detailsHtml(r, `<p style="margin-top:16px;color:#666;">Aceda ao painel admin para confirmar ou recusar esta reserva.</p>`)
  );
}

// Customer emails are in English (the site's language).
function confirmToCustomer(r: ResData) {
  return sendEmail(
    r.email,
    `Booking request received - ${r.courseTitle}`,
    detailsHtml(r, `<p style="margin-top:16px;background:#f3f4f6;padding:12px;border-radius:8px;">Thank you! We have received your booking request. Cátia will contact you on WhatsApp to confirm it. Your booking stays <strong>pending</strong> until then.</p>`, 'en')
  );
}

function approveToCustomer(r: ResData) {
  return sendEmail(
    r.email,
    `✔ Booking confirmed - ${r.courseTitle}`,
    detailsHtml(r, `<p style="margin-top:16px;background:#ecfdf5;padding:12px;border-radius:8px;"><strong>Your booking is confirmed!</strong> We look forward to welcoming you on ${esc(r.date)} at ${esc(r.time)}.</p>`, 'en')
  );
}

function declineToCustomer(r: ResData) {
  return sendEmail(
    r.email,
    `Booking update - ${r.courseTitle}`,
    detailsHtml(r, `<p style="margin-top:16px;background:#fef2f2;padding:12px;border-radius:8px;">Unfortunately we can't confirm this booking. Please choose another date on our website or contact Cátia on WhatsApp — we'd love to have you another day.</p>`, 'en')
  );
}

function todayInCapeVerde(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Atlantic/Cape_Verde' }).format(new Date());
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  const isAdmin = await isAdminRequest(request);
  // Admin manual entries aren't rate-limited — the risk here is a script
  // hitting the public booking form, not the site owner using her own panel.
  if (!isAdmin && (await isRateLimited('reservations', clientIp(request), 8, 15 * 60 * 1000))) {
    return NextResponse.json({ error: 'Too many booking attempts. Please try again later or contact us on WhatsApp.' }, { status: 429 });
  }
  try {
    await ensureNoLegacyCourseFk();
    const body = await request.json();
    const { studentName, email, phone, courseId, date, notes, dietaryRestrictions } = body;

    const name = typeof studentName === 'string' ? studentName.trim() : '';
    const mail = typeof email === 'string' ? email.trim() : '';
    const tel = typeof phone === 'string' ? phone.trim() : '';
    const guests = Math.floor(Number(body.guests) || 0);

    if (!name || !mail || !courseId || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (!EMAIL_RE.test(mail)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: 'Invalid date' }, { status: 400 });
    }

    const isDinner = isRestaurantBooking(String(courseId));
    let course: any = RESTAURANT_DINNER;
    if (!isDinner) {
      const courseRows: any = await query('SELECT * FROM courses WHERE id = ?', [String(courseId)]);
      course = courseRows?.[0];
      if (!course || (!course.active && !isAdmin)) {
        return NextResponse.json({ error: 'This class is not available' }, { status: 400 });
      }
    }
    const maxCapacity = Number(course.maxCapacity) || 8;
    const minGuests = isDinner && !isAdmin ? RESTAURANT_MIN_GUESTS : 1;
    if (guests < minGuests || guests > maxCapacity) {
      return NextResponse.json({ error: `Guests must be between ${minGuests} and ${maxCapacity}` }, { status: 400 });
    }

    // A class runs at one fixed hour, so its time comes from the course. The
    // dinner has several seatings the guest picks from (configured in Admin →
    // Settings), so the chosen one is validated against that list here — a
    // visitor must not be able to invent a seating that isn't offered. For
    // manual entries the admin may type any schedule.
    let time: string = course.timeSlot || '';
    if (isAdmin && typeof body.time === 'string' && body.time) {
      time = body.time;
    } else if (isDinner) {
      const slots = parseTimeSlots(await getSetting('restaurant_time_slots'));
      const picked = typeof body.time === 'string' ? body.time.trim() : '';
      if (picked && !slots.includes(picked)) {
        return NextResponse.json(
          { error: 'That dinner seating is not available. Please choose one of the times offered.' },
          { status: 400 }
        );
      }
      time = picked || slots[0];
    }

    // Visitors can't book past or blocked days; the admin may (manual entries).
    if (!isAdmin) {
      if (date < todayInCapeVerde()) {
        return NextResponse.json({ error: 'Please choose a future date' }, { status: 400 });
      }
      const blocked: any = await query('SELECT id FROM blockedDates WHERE date = ?', [date]);
      if (blocked?.length) {
        return NextResponse.json({ error: 'This date is no longer available. Please choose another date.' }, { status: 409 });
      }

      // maxCapacity above only checked THIS booking's own guest count; without
      // this, two separate bookings of e.g. 8 guests each could both go
      // through for the same 8-person class/date, silently double-booking it.
      // Each dinner seating (e.g. 18:00 and 21:00) is a separate sitting with
      // its own table capacity, so they are counted apart; a class has a
      // single time per date, so it is counted per date.
      const existing: any = isDinner
        ? await query(
            `SELECT COALESCE(SUM(guests), 0) AS total FROM reservations
             WHERE courseId = ? AND date = ? AND time = ? AND status NOT IN ('cancelled', 'cancelada')`,
            [String(courseId), date, time]
          )
        : await query(
            `SELECT COALESCE(SUM(guests), 0) AS total FROM reservations
             WHERE courseId = ? AND date = ? AND status NOT IN ('cancelled', 'cancelada')`,
            [String(courseId), date]
          );
      const alreadyBooked = Number(existing?.[0]?.total) || 0;
      if (alreadyBooked + guests > maxCapacity) {
        const remaining = Math.max(0, maxCapacity - alreadyBooked);
        const slot = isDinner ? 'seating' : 'date';
        const alternative = isDinner ? 'another time or date' : 'another date';
        return NextResponse.json(
          {
            error: remaining > 0
              ? `Only ${remaining} spot${remaining === 1 ? '' : 's'} left for this ${slot}. Please choose fewer guests or ${alternative}.`
              : `This ${slot} is fully booked. Please choose ${alternative}.`,
          },
          { status: 409 }
        );
      }
    }

    const courseTitle: string = course.title;
    const unitPrice = Number(course.priceNumber) || 0;
    const totalPrice = isAdmin && Number(body.totalPrice) > 0 ? Number(body.totalPrice) : unitPrice * guests;
    const currency = 'EUR';
    const status = isAdmin && typeof body.status === 'string' ? body.status : 'pending';
    const paymentStatus = isAdmin && typeof body.paymentStatus === 'string' ? body.paymentStatus : 'on_arrival';

    const id = `res-${Date.now()}-${randomBytes(3).toString('hex')}`;

    await query(
      'INSERT INTO reservations (id, studentName, email, phone, courseId, courseTitle, date, time, guests, totalPrice, currency, notes, dietaryRestrictions, status, paymentStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, mail, tel, String(courseId), courseTitle, date, time, guests, totalPrice, currency, String(notes || ''), String(dietaryRestrictions || ''), status, paymentStatus]
    );

    const resData: ResData = {
      studentName: name, email: mail, phone: tel, courseTitle,
      date, time, guests, totalPrice, currency,
    };

    // Admin-created bookings: no "new booking" alerts; confirm to the customer if already confirmed.
    if (isAdmin) {
      if (status === 'confirmed') approveToCustomer(resData);
      return NextResponse.json({ success: true, id, courseTitle, time, totalPrice, status, paymentStatus }, { status: 201 });
    }

    notifyAdmin(resData).catch((err) => console.error('Admin notify failed:', err));
    confirmToCustomer(resData);

    // Aviso de "Nova Reserva" também por WhatsApp para o número configurado
    // pelo admin em Settings (notify_whatsapp). Sem número ou sem credenciais,
    // simplesmente não faz nada.
    getSetting('notify_whatsapp')
      .then((adminPhone) => {
        if (!adminPhone) return;
        return sendWhatsAppNewReservation(adminPhone, {
          studentName: name,
          email: mail,
          phone: tel,
          courseTitle,
          date,
          time,
          guests,
          totalPrice,
        });
      })
      .catch((err) => console.error('WhatsApp new-reservation notify failed:', err));

    return NextResponse.json({ success: true, id, courseTitle, time, totalPrice, status, paymentStatus }, { status: 201 });
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
    await ensureNoLegacyCourseFk();
    const body = await request.json();
    const {
      id, studentName, email, phone, courseId, courseTitle, date, time,
      guests, totalPrice, currency, notes, dietaryRestrictions, status, paymentStatus,
    } = body;

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Missing reservation id' }, { status: 400 });
    }

    const rows: any = await query('SELECT * FROM reservations WHERE id = ?', [id]);
    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }
    const r = rows[0];

    // Manually resend the customer's email (confirmation or approval,
    // whichever matches the current status) without changing anything else
    // — for when the automatic one didn't arrive (e.g. a delivery issue).
    if (body.resendEmail === true) {
      if (!r.email) {
        return NextResponse.json({ error: 'This booking has no email address saved.' }, { status: 400 });
      }
      const resData: ResData = {
        studentName: r.studentName,
        email: r.email,
        phone: r.phone || '',
        courseTitle: r.courseTitle,
        date: r.date,
        time: r.time || '',
        guests: r.guests || 1,
        totalPrice: Number(r.totalPrice) || 0,
        currency: r.currency || 'EUR',
      };
      const isConfirmedNow = r.status === 'confirmed' || r.status === 'confirmada';
      const isCancelledNow = r.status === 'cancelled' || r.status === 'cancelada';
      // Awaited, unlike the automatic emails: a manual resend is only useful
      // if the panel says whether it actually went out this time.
      const sent = isCancelledNow
        ? await declineToCustomer(resData)
        : isConfirmedNow
          ? await approveToCustomer(resData)
          : await confirmToCustomer(resData);
      if (!sent.ok) {
        return NextResponse.json({ error: sent.error }, { status: 502 });
      }
      return NextResponse.json({ success: true, resent: true, email: r.email });
    }

    const newStatus = status ?? r.status;
    const newPayment = paymentStatus ?? r.paymentStatus;

    await query(
      `UPDATE reservations SET
        studentName = ?, email = ?, phone = ?, courseId = ?, courseTitle = ?,
        date = ?, time = ?, guests = ?, totalPrice = ?, currency = ?,
        notes = ?, dietaryRestrictions = ?, status = ?, paymentStatus = ?
       WHERE id = ?`,
      [
        studentName ?? r.studentName,
        email ?? r.email,
        phone ?? r.phone,
        courseId ?? r.courseId,
        courseTitle ?? r.courseTitle,
        date ?? r.date,
        time ?? r.time,
        guests ?? r.guests,
        totalPrice ?? r.totalPrice,
        currency ?? r.currency,
        notes ?? r.notes,
        dietaryRestrictions ?? r.dietaryRestrictions,
        newStatus,
        newPayment,
        id,
      ]
    );

    const wasConfirmed = r.status === 'confirmed' || r.status === 'confirmada';
    const nowConfirmed = newStatus === 'confirmed' || newStatus === 'confirmada';
    const wasPending = r.status === 'pending' || r.status === 'pendente';
    const nowCancelled = newStatus === 'cancelled' || newStatus === 'cancelada';
    if (wasPending && nowCancelled) {
      declineToCustomer({
        studentName: studentName ?? r.studentName,
        email: email ?? r.email,
        phone: (phone ?? r.phone) || '',
        courseTitle: courseTitle ?? r.courseTitle,
        date: date ?? r.date,
        time: (time ?? r.time) || '',
        guests: (guests ?? r.guests) || 1,
        totalPrice: Number(totalPrice ?? r.totalPrice) || 0,
        currency: (currency ?? r.currency) || 'EUR',
      });
    }
    if (nowConfirmed && !wasConfirmed) {
      approveToCustomer({
        studentName: studentName ?? r.studentName,
        email: email ?? r.email,
        phone: (phone ?? r.phone) || '',
        courseTitle: courseTitle ?? r.courseTitle,
        date: date ?? r.date,
        time: (time ?? r.time) || '',
        guests: (guests ?? r.guests) || 1,
        totalPrice: Number(totalPrice ?? r.totalPrice) || 0,
        currency: (currency ?? r.currency) || 'EUR',
      });

      // Confirmação também por WhatsApp (envia só se as credenciais existirem;
      // sem credenciais retorna configured:false e não faz nada).
      const custPhone = (phone ?? r.phone) || '';
      if (custPhone) {
        sendWhatsAppBookingConfirmation({
          phoneNumber: custPhone,
          studentName: studentName ?? r.studentName,
          courseTitle: courseTitle ?? r.courseTitle,
          date: date ?? r.date,
          time: (time ?? r.time) || '',
          guests: (guests ?? r.guests) || 1,
          totalPrice: Number(totalPrice ?? r.totalPrice) || 0,
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
