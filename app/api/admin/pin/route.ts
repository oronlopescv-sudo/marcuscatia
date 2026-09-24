import { NextResponse } from 'next/server';
import { getSetting, setSetting } from '@/lib/settings';

const DEFAULT_PIN = '1234';

export async function POST(request: Request) {
  try {
    const { currentPin, newPin } = await request.json();

    if (!currentPin || typeof currentPin !== 'string') {
      return NextResponse.json({ ok: false, error: 'Informe o PIN atual' }, { status: 400 });
    }
    if (!newPin || typeof newPin !== 'string' || newPin.trim().length < 4) {
      return NextResponse.json({ ok: false, error: 'O novo PIN deve ter pelo menos 4 caracteres' }, { status: 400 });
    }

    const stored = (await getSetting('admin_pin')) || DEFAULT_PIN;
    if (currentPin !== stored) {
      return NextResponse.json({ ok: false, error: 'PIN atual incorreto' }, { status: 403 });
    }

    await setSetting('admin_pin', newPin.trim());
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Admin PIN change error:', error);
    return NextResponse.json(
      { ok: false, error: 'Falha ao alterar o PIN' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Não devolvemos o PIN; apenas confirmamos que o painel aceita config.
  return NextResponse.json({ message: 'POST { currentPin, newPin } para trocar o PIN do admin' });
}
