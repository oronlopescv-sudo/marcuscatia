export interface WhatsAppMessage {
  phoneNumber: string;
  courseTitle: string;
  date: string;
  time: string;
  guests: number;
  totalPrice: number;
  studentName: string;
}

export interface WhatsAppResult {
  sent: boolean;
  configured: boolean;
  reason?: string;
  phone?: string;
}

// Envia uma confirmação de reserva via WhatsApp Cloud API (Meta).
// Sem credenciais, devolve sent:false/configured:false (não finge envio).
export async function sendWhatsAppBookingConfirmation(message: WhatsAppMessage): Promise<WhatsAppResult> {
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
    return { sent: false, configured: false, reason: 'WHATSAPP_ACCESS_TOKEN / WHATSAPP_PHONE_NUMBER_ID não definidos' };
  }

  // Normaliza para E.164 (adiciona o código 238 se faltar).
  const digits = message.phoneNumber.replace(/[^0-9]/g, '');
  const to = digits.startsWith('238') ? digits : `238${digits}`;

  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
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
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('[WhatsApp] Cloud API error:', res.status, data);
      return { sent: false, configured: true, reason: data?.error?.message || 'Cloud API error', phone: to };
    }
    return { sent: true, configured: true, phone: to };
  } catch (error) {
    console.error('[WhatsApp] send error:', error);
    return { sent: false, configured: true, reason: error instanceof Error ? error.message : 'Unknown error', phone: to };
  }
}
