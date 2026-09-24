import { NextResponse } from 'next/server';
import { getSetting, setSetting } from '@/lib/settings';

// Chaves usadas no painel admin (Site Information)
const KEYS = ['site_title', 'site_email', 'site_whatsapp', 'site_location', 'notify_whatsapp'] as const;

export async function GET() {
  try {
    const out: Record<string, string> = {};
    for (const k of KEYS) {
      out[k] = (await getSetting(k)) || '';
    }
    return NextResponse.json(out);
  } catch (error) {
    console.error('Error reading settings:', error);
    return NextResponse.json({ error: 'Failed to read settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
    }
    for (const k of KEYS) {
      if (typeof body[k] === 'string') {
        await setSetting(k, body[k].trim());
      }
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
