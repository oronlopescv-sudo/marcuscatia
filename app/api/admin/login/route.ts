import { NextResponse } from 'next/server';
import { getSetting } from '@/lib/settings';

const DEFAULT_PIN = '1234';

export async function POST(request: Request) {
  try {
    const { pin } = await request.json();
    if (!pin || typeof pin !== 'string') {
      return NextResponse.json({ ok: false, error: 'PIN obrigatório' }, { status: 400 });
    }

    const stored = (await getSetting('admin_pin')) || DEFAULT_PIN;
    return NextResponse.json({ ok: pin === stored });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { ok: false, error: 'Falha ao verificar o PIN' },
      { status: 500 }
    );
  }
}
