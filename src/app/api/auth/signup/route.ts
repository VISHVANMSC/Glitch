import { NextResponse } from 'next/server';
import { z } from 'zod';
import { dataService } from '@/lib/dataService';
import { hashPassword, setAuthCookie } from '@/lib/auth';

import { sendWelcomeSignupEmail } from '@/lib/email';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least 1 uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least 1 lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least 1 number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least 1 special character'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = signupSchema.parse(body);

    const existingUser = await dataService.findUserByEmail(parsed.email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please login instead.' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(parsed.password);

    const user = await dataService.createUser({
      name: parsed.name,
      email: parsed.email,
      phone: parsed.phone,
      passwordHash,
      role: 'TEAM_LEADER',
    });

    await setAuthCookie({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // Dispatch welcome email asynchronously
    sendWelcomeSignupEmail({ email: user.email, name: user.name }).catch((err) => {
      console.error('Failed to send welcome email:', err);
    });

    return NextResponse.json({
      message: 'Account registered successfully! We’ve sent a welcome email to your registered address. If you don’t see it in your inbox, please check your Spam/Junk folder.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || error.message }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
