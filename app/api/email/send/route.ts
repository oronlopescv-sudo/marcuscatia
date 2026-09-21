import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/email/send
 * 
 * TODO: Integrate with SendGrid or Resend
 * 
 * Expected body:
 * {
 *   to: "email@example.com",
 *   subject: "Booking Confirmation",
 *   template: "booking-confirmation",
 *   data: {
 *     studentName: "John Doe",
 *     courseTitle: "Traditional Cooking Class",
 *     date: "2026-09-25",
 *     time: "09:30 - 13:30",
 *     guests: 4,
 *     totalPrice: 180
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, template, data } = body;

    if (!to || !subject) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject' },
        { status: 400 }
      );
    }

    // TODO: Implement actual email sending logic
    // Option 1: SendGrid
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // await sgMail.send({ to, from: 'noreply@catiacooking.com', subject, html });
    
    // Option 2: Resend
    // const { Resend } = require('resend');
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({ to, subject, html, from: 'noreply@catiacooking.com' });

    // For now, just log the email
    console.log('📧 Email notification queued:', {
      to,
      subject,
      template,
      recipient: data?.studentName || 'Unknown',
    });

    return NextResponse.json(
      {
        success: true,
        message: `Email queued for ${to}`,
        template,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('POST /api/email/send error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
