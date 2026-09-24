import { NextRequest, NextResponse } from 'next/server';

interface WhatsAppMessage {
  phoneNumber: string;
  courseTitle: string;
  date: string;
  time: string;
  guests: number;
  totalPrice: number;
  studentName: string;
}

// Envia via WhatsApp Cloud API (Meta) se as credenciais estiverem configuradas.
// Sem credenciais, devolve sent:false e configured:false (NÃO finge envio).
async function sendViaWhatsApp(message: WhatsAppMessage) {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  const messageText = `
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

  if (!accessToken || !phoneNumberId) {
    console.log('[WhatsApp] NOT configured — message not sent:', message.phoneNumber);
    return {
      sent: false,
      configured: false,
      reason: 'WHATSAPP_ACCESS_TOKEN / WHATSAPP_PHONE_NUMBER_ID não definidos',
    };
  }

  // Normaliza o número para o formato internacional E.164 esperado pelo Meta.
  const digits = message.phoneNumber.replace(/[^0-9]/g, '');
  const to = digits.startsWith('238') ? digits : `238${digits}`;

  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to,
          type: 'text',
          text: { body: messageText },
        }),
      }
    );

    const data = await res.json();
    if (!res.ok) {
      console.error('[WhatsApp] Cloud API error:', res.status, data);
      return { sent: false, configured: true, reason: data?.error?.message || 'Cloud API error' };
    }

    return { sent: true, configured: true, phone: to, message: messageText };
  } catch (error) {
    console.error('[WhatsApp] send error:', error);
    return { sent: false, configured: true, reason: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: WhatsAppMessage = await request.json();

    // Validar telefone
    if (!data.phoneNumber || !data.phoneNumber.match(/^[0-9+\-\s()]+$/)) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
    }

    const result = await sendViaWhatsApp(data);
    return NextResponse.json(result);
  } catch (error) {
    console.error('WhatsApp notification error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
