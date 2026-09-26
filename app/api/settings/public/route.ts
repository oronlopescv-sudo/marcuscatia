import { NextResponse } from 'next/server';
import { getSetting } from '@/lib/settings';
import { PUBLIC_SITE_KEYS } from '@/lib/siteInfo';

// GET — the public contact details (no admin-only settings).
export async function GET() {
  try {
    const out: Record<string, string> = {};
    for (const k of PUBLIC_SITE_KEYS) {
      out[k] = (await getSetting(k)) || '';
    }
    return NextResponse.json(out);
  } catch (error) {
    console.error('Error reading public settings:', error);
    return NextResponse.json({}, { status: 200 });
  }
}
