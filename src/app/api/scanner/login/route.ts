import { NextResponse } from 'next/server';
import { z } from 'zod';
import { dataService } from '@/lib/dataService';
import { comparePassword, setAuthCookie } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

const scannerLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(req: Request) {
  try {
    const clientIp = getClientIp(req);
    const rateCheck = checkRateLimit(clientIp, 'scanner_login', 5, 60000); // 5 attempts per minute
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please wait a minute before trying again.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = scannerLoginSchema.parse(body);

    const cleanEmail = parsed.email.trim().toLowerCase();
    const cleanPassword = parsed.password.trim();

    const user = await dataService.findUserByEmail(cleanEmail);
    if (!user) {
      return NextResponse.json({ error: 'Invalid scanner credentials' }, { status: 401 });
    }

    if (user.role !== 'SCANNER' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied. Account is not authorized as an Attendance Scanner.' }, { status: 403 });
    }

    if (user.isActive === false) {
      return NextResponse.json({ error: 'This scanner account has been disabled by Admin.' }, { status: 403 });
    }

    const isValid = await comparePassword(cleanPassword, user.passwordHash);
    if (!isValid) {
      await dataService.logAudit({
        userId: user.id,
        userEmail: user.email,
        userRole: user.role,
        action: 'SCANNER_LOGIN_FAILED',
        details: `Failed scanner login attempt for email "${cleanEmail}"`,
      }).catch(() => {});
      return NextResponse.json({ error: 'Invalid scanner credentials' }, { status: 401 });
    }

    await setAuthCookie({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    await dataService.logAudit({
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      action: 'SCANNER_LOGIN',
      details: `Scanner operator "${user.name}" logged into scanner portal`,
    });

    return NextResponse.json({
      message: 'Scanner login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        allowedEvents: user.allowedEvents,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || error.message }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
