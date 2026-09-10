import { NextResponse } from 'next/server';
import { sendTestEmail } from '@/lib/email-service';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const targetEmail = body.email || null;

    const result = await sendTestEmail(targetEmail);
    if (!result.success) {
      return NextResponse.json(
        { error: 'SMTP connection failed: ' + result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Test email successfully sent to ${result.recipient}!`,
      messageId: result.messageId,
    });
  } catch (err) {
    console.error('Test email route error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
