import { NextResponse } from 'next/server';
import { storeContactSubmission } from '@/lib/settings-service';
import { sendContactNotification } from '@/lib/email-service';
import { verifyCaptcha } from '@/lib/recaptcha';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, subject, message, captchaToken } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Please enter your name.' }, { status: 400 });
    }
    if (!email || !email.trim() || !email.includes('@')) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }
    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Please enter your message.' }, { status: 400 });
    }

    // Client IP for logging and reCAPTCHA
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;

    // Verify reCAPTCHA token if configured
    const captchaResult = await verifyCaptcha(captchaToken, ip);
    if (!captchaResult.success) {
      return NextResponse.json({ error: captchaResult.error }, { status: 400 });
    }

    // Store in database
    const submissionId = await storeContactSubmission({
      name: name.trim(),
      email: email.trim(),
      subject: (subject || '').trim(),
      message: message.trim(),
      ip,
    });

    // Send Google SMTP notification in background / synchronously
    const emailResult = await sendContactNotification({
      name: name.trim(),
      email: email.trim(),
      subject: (subject || '').trim(),
      message: message.trim(),
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your message has been sent successfully.',
      submissionId,
      emailSent: emailResult.success,
    });
  } catch (err) {
    console.error('Contact submission error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred while sending your message. Please try again.' },
      { status: 500 }
    );
  }
}
