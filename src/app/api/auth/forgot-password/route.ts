import { NextResponse } from 'next/server';
import { z } from 'zod';
import { dataService } from '@/lib/dataService';
import { sendPasswordResetEmail } from '@/lib/email';
import { signPasswordResetToken } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

const schema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(req: Request) {
  try {
    const clientIp = getClientIp(req);
    const rateCheck = checkRateLimit(clientIp, 'forgot_password', 3, 900000); // 3 requests per 15 minutes
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Too many password reset requests. Please wait 15 minutes before trying again.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { email } = schema.parse(body);

    const user = await dataService.findUserByEmail(email);
    if (user) {
      const resetToken = signPasswordResetToken({ userId: user.id, email: user.email });
      await sendPasswordResetEmail({ email: user.email, resetToken }).catch((err) => {
        console.error('Failed to send password reset email:', err);
      });
    }

    return NextResponse.json({
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || error.message }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
