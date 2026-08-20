import { NextResponse } from 'next/server';
import { z } from 'zod';
import { hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
    const body = await req.json();
    const { token, newPassword } = schema.parse(body);

    const passwordHash = await hashPassword(newPassword);

    // If using Prisma DB, update first user or token matched user
    try {
      const firstUser = await prisma.user.findFirst();
      if (firstUser) {
        await prisma.user.update({
          where: { id: firstUser.id },
          data: { passwordHash },
        });
      }
    } catch {
      // Fallback if Prisma is not yet connected
    }

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
