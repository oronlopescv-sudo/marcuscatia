export interface WhatsAppResult {
  sent: boolean;
  configured: boolean;
  reason?: string;
  phone?: string;
}

export interface WhatsAppMessage {
  phoneNumber: string;
  courseTitle: string;
  date: string;
  time: string;
  guests: number;
  totalPrice: number;
  studentName: string;
}

// Núcleo: envia um texto simples via WhatsApp Cloud API (Meta).
export async function sendWhatsApp(to: string, body: string): Promise<WhatsAppResult> {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!accessToken || !phoneNumberId) {
    console.log('[WhatsApp] NOT configured — message not sent:', to);
    return { sent: false, configured: false, reason: 'WHATSAPP_ACCESS_TOKEN / WHATSAPP_PHONE_NUMBER_ID não definidos' };
  }

  const digits = to.replace(/[^0-9]/g, '');
  const normalized = digits.startsWith('238') ? digits : `238${digits}`;

  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: normalized,
        type: 'text',
        text: { body },
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('[WhatsApp] Cloud API error:', res.status, data);
      return { sent: false, configured: true, reason: data?.error?.message || 'Cloud API error', phone: normalized };
    }
    return { sent: true, configured: true, phone: normalized };
  } catch (error) {
    console.error('[WhatsApp] send error:', error);
    return { sent: false, configured: true, reason: error instanceof Error ? error.message : 'Unknown error', phone: normalized };
  }
}

// Confirmação enviada ao CLIENTE quando o admin aprova a reserva.
export async function sendWhatsAppBookingConfirmation(message: WhatsAppMessage): Promise<WhatsAppResult> {
  const text = `
🍳 *Booking Confirmed!*

Olá ${message.studentName}!

✅ Your cooking class with Cátia has been confirmed:

📍 Class: ${message.courseTitle}
📅 Date: ${message.date}
🕐 Time: ${message.time}
👥 Guests: ${message.guests}
💰 Total: €${message.totalPrice}

If you need to reschedule or have questions, please reply to this message or contact us.

We're excited to see you in the kitchen! 🎉

Cátia Cooking Mindelo
`.trim();
  return sendWhatsApp(message.phoneNumber, text);
}

// Aviso enviado ao ADMIN (número configurado em Settings) sobre uma nova reserva.
export async function sendWhatsAppNewReservation(
  adminPhone: string,
  r: {
    studentName: string;
    email: string;
    phone: string;
    courseTitle: string;
    date: string;
    time: string;
    guests: number;
    totalPrice: number;
  }
): Promise<WhatsAppResult> {
  const text = `
🍳 *Nova Reserva!*

👤 Nome: ${r.studentName}
📧 Email: ${r.email}
📱 WhatsApp: ${r.phone}
📍 Curso: ${r.courseTitle}
📅 Data: ${r.date}
🕐 Horário: ${r.time}
👥 Convidados: ${r.guests}
💰 Total: €${r.totalPrice}

Aceda ao painel admin para confirmar ou recusar esta reserva.
`.trim();
  return sendWhatsApp(adminPhone, text);
}
