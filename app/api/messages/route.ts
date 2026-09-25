import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendEmail, esc, resolveNotifyEmail } from '@/lib/email';

export async function GET() {
  try {
    const messages = await query('SELECT * FROM messages ORDER BY createdAt DESC');
    return NextResponse.json({ messages }, { status: 200 });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const id = `msg-${Date.now()}`;

    await query(
      'INSERT INTO messages (id, name, email, phone, subject, message, `read`) VALUES (?, ?, ?, ?, ?, ?, 0)',
      [id, name, email, phone || '', subject || '', message]
    );

    // Avisa o admin por email (config "notify_email" ou NOTIFY_EMAIL da env).
    resolveNotifyEmail()
      .then((notifyEmail) => {
        if (!notifyEmail) {
          console.log('📧 Nova mensagem (email do admin não configurado):', name);
          return;
        }
        const html = `
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#222;">
            <h2 style="color:#0A3D78;">Nova mensagem do site</h2>
            <p><strong>Nome:</strong> ${esc(name)}</p>
            <p><strong>Email:</strong> ${esc(email)}</p>
            <p><strong>Telefone:</strong> ${esc(phone || '')}</p>
            <p><strong>Assunto:</strong> ${esc(subject || '')}</p>
            <p><strong>Mensagem:</strong></p>
            <p>${esc(message)}</p>
          </div>`;
        return sendEmail(notifyEmail, `Nova mensagem: ${name}`, html);
      })
      .catch((err) => console.error('Message notify failed:', err));

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
  }
}

// PATCH - marcar mensagem como lida/não lida
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, read } = body;
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }
    await query('UPDATE messages SET `read` = ? WHERE id = ?', [read ? 1 : 0, id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
  }
}

// DELETE - apagar mensagem (?id=...)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }
    await query('DELETE FROM messages WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
  }
}
