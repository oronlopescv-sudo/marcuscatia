import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppBookingConfirmation } from '@/lib/whatsapp';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validar telefone
    if (!data.phoneNumber || !data.phoneNumber.match(/^[0-9+\-\s()]+$/)) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
    }

    const result = await sendWhatsAppBookingConfirmation(data);
    return NextResponse.json(result);
  } catch (error) {
    console.error('WhatsApp notification error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
