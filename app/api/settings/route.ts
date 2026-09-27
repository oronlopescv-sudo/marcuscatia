import { NextResponse } from 'next/server';
import { getSetting, setSetting } from '@/lib/settings';
import { parseTimeSlots } from '@/lib/restaurant';

// Chaves usadas no painel admin (Site Information)
const KEYS = ['site_title', 'site_email', 'site_whatsapp', 'site_location', 'notify_whatsapp', 'notify_email', 'restaurant_time_slots'] as const;

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
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    for (const k of KEYS) {
      if (typeof body[k] === 'string') {
        // The dinner seatings are stored as a normalised "HH:MM,HH:MM" list so
        // the booking form and the server always agree on what is bookable;
        // anything unparseable falls back to the defaults.
        const value = k === 'restaurant_time_slots'
          ? parseTimeSlots(body[k]).join(',')
          : body[k].trim();
        await setSetting(k, value);
      }
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
