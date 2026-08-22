import { NextResponse } from 'next/server';
import { z } from 'zod';
import { hashPassword, verifyPasswordResetToken } from '@/lib/auth';
import { dataService } from '@/lib/dataService';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

const schema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least 1 uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least 1 lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least 1 number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least 1 special character'),
});

export async function POST(req: Request) {
  try {
    const clientIp = getClientIp(req);
    const rateCheck = checkRateLimit(clientIp, 'reset_password', 5, 900000); // 5 attempts per 15 minutes
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Too many password reset attempts. Please wait 15 minutes before trying again.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { token, newPassword } = schema.parse(body);

    const payload = verifyPasswordResetToken(token);
    if (!payload || !payload.email) {
      return NextResponse.json(
        { error: 'Invalid or expired password reset link. Please request a new link.' },
        { status: 400 }
      );
    }

    const user = await dataService.findUserByEmail(payload.email);
    if (!user) {
      return NextResponse.json({ error: 'User account not found.' }, { status: 404 });
    }

    const passwordHash = await hashPassword(newPassword);
    await dataService.updateUserPassword(user.id, passwordHash);

    await dataService.logAudit({
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      action: 'PASSWORD_RESET',
      details: `Password reset successfully via reset token for ${user.email}`,
    });

    return NextResponse.json({
      message: 'Your password has been reset successfully. You can now log in with your new password.',
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || error.message }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
