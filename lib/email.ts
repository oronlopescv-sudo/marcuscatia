// Envio de email via Resend (compartilhado entre as rotas).
import { getSetting } from '@/lib/settings';

// Never throws, so fire-and-forget callers stay safe, but it now SAYS whether
// the email actually left: a silent `void` made the admin panel report success
// for emails Resend had rejected.
export type SendEmailResult = { ok: true } | { ok: false; error: string };

export async function sendEmail(to: string, subject: string, html: string): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFY_FROM_EMAIL || 'Catia Cooking <onboarding@resend.dev>';
  if (!apiKey) {
    console.log('📧 Email not sent (RESEND_API_KEY not set):', subject, '->', to);
    return { ok: false, error: 'Email sending is not configured on the server (RESEND_API_KEY is missing).' };
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to, subject, html }),
    });
    if (!res.ok) {
      const errBody = await res.text();
      console.error('Resend API error:', res.status, errBody);
      return { ok: false, error: describeResendError(res.status, errBody, from) };
    }
    return { ok: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { ok: false, error: 'Could not reach the email service. Please try again in a moment.' };
  }
}

// Resend's own message is usually the most useful thing to show, but its
// sandbox rejection needs restating as what the site owner has to change:
// while no domain is verified, `onboarding@resend.dev` only delivers to the
// Resend account owner's own address, so customers never get anything.
function describeResendError(status: number, body: string, from: string): string {
  let message = '';
  try {
    const parsed = JSON.parse(body);
    message = String(parsed?.message || parsed?.error?.message || '');
  } catch {
    message = body.slice(0, 200);
  }
  if (status === 403 && /testing emails|own email address|verify a domain/i.test(message)) {
    return `The email service is still in test mode, so it only delivers to the account owner's own address. Verify the domain at resend.com/domains and set NOTIFY_FROM_EMAIL to an address on it (it is currently "${from}").`;
  }
  if (status === 401 || status === 403) {
    return message || 'The email service refused the request — check RESEND_API_KEY on the server.';
  }
  return message || `The email service rejected the message (HTTP ${status}).`;
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
