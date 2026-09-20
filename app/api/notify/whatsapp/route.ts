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

async function sendViaWhatsApp(message: WhatsAppMessage) {
  // Se usar Twilio, descomente:
  // const accountSid = process.env.TWILIO_ACCOUNT_SID;
  // const authToken = process.env.TWILIO_AUTH_TOKEN;
  // const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

  // Por agora, simular envio (em produção, usar Twilio/WhatsApp Business API)
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

  console.log(`[WhatsApp] Message to ${message.phoneNumber}:`, messageText);

  return {
    sent: true,
    phone: message.phoneNumber,
    message: messageText,
  };
}

export async function POST(request: NextRequest) {
  try {
    const data: WhatsAppMessage = await request.json();

    // Validar telefone
    if (!data.phoneNumber || !data.phoneNumber.match(/^[0-9+\-\s()]+$/)) {
      return NextResponse.json(
        { error: 'Invalid phone number' },
        { status: 400 }
      );
    }

    // Enviar via WhatsApp
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
