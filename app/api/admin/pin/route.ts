import { NextResponse } from 'next/server';
import { getSetting, setSetting } from '@/lib/settings';

const DEFAULT_PIN = '1234';

export async function POST(request: Request) {
  try {
    const { currentPin, newPin } = await request.json();

    if (!currentPin || typeof currentPin !== 'string') {
      return NextResponse.json({ ok: false, error: 'Enter the current PIN' }, { status: 400 });
    }
    if (!newPin || typeof newPin !== 'string' || newPin.trim().length < 4) {
      return NextResponse.json({ ok: false, error: 'The new PIN must have at least 4 characters' }, { status: 400 });
    }

    const stored = (await getSetting('admin_pin')) || DEFAULT_PIN;
    if (currentPin !== stored) {
      return NextResponse.json({ ok: false, error: 'Current PIN is incorrect' }, { status: 403 });
    }

    await setSetting('admin_pin', newPin.trim());
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Admin PIN change error:', error);
    return NextResponse.json(
      { ok: false, error: 'Could not change the PIN' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Não devolvemos o PIN; apenas confirmamos que o painel aceita config.
  return NextResponse.json({ message: 'POST { currentPin, newPin } para trocar o PIN do admin' });
}
