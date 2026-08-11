import { NextResponse } from 'next/server';
import { z } from 'zod';
import { dataService } from '@/lib/dataService';
import { comparePassword, setAuthCookie } from '@/lib/auth';

const scannerLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = scannerLoginSchema.parse(body);

    const user = await dataService.findUserByEmail(parsed.email);
    if (!user) {
      return NextResponse.json({ error: 'Invalid scanner credentials' }, { status: 401 });
    }

    if (user.role !== 'SCANNER' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied. Account is not authorized as an Attendance Scanner.' }, { status: 403 });
    }

    if (user.isActive === false) {
      return NextResponse.json({ error: 'This scanner account has been disabled by Admin.' }, { status: 403 });
    }

    const isValid = await comparePassword(parsed.password, user.passwordHash);
    if (!isValid) {
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
