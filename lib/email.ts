// Envio de email via Resend (compartilhado entre as rotas).
import { getSetting } from '@/lib/settings';

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log('📧 Email not sent (RESEND_API_KEY not set):', subject, '->', to);
    return;
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.NOTIFY_FROM_EMAIL || 'Catia Cooking <onboarding@resend.dev>',
        to,
        subject,
        html,
      }),
    });
    if (!res.ok) {
      const errBody = await res.text();
      console.error('Resend API error:', res.status, errBody);
    }
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

export function esc(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Email do admin para receber avisos: prioriza a config "notify_email"
// gravada no painel, senão usa a variável NOTIFY_EMAIL.
export async function resolveNotifyEmail(): Promise<string> {
  try {
    const stored = await getSetting('notify_email');
    if (stored) return stored;
  } catch (e) {
    console.error('Error reading notify_email setting:', e);
  }
  return process.env.NOTIFY_EMAIL || '';
}
