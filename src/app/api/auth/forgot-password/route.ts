import { NextResponse } from 'next/server';
import { z } from 'zod';
import { dataService } from '@/lib/dataService';
import { sendPasswordResetEmail } from '@/lib/email';

const schema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = schema.parse(body);

    const user = await dataService.findUserByEmail(email);
    if (user) {
      const resetToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
      await sendPasswordResetEmail({ email, resetToken });
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
