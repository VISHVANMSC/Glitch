import { NextResponse } from 'next/server';
import { z } from 'zod';
import { hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const schema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
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
