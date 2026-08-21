import { NextResponse } from 'next/server';
import { getSessionUser, hashPassword } from '@/lib/auth';
import { dataService } from '@/lib/dataService';

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || sessionUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    const scanners = await dataService.getScanners();
    const sanitizedScanners = scanners.map((s: any) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      phone: s.phone,
      role: s.role,
      isActive: s.isActive ?? true,
      allowedEvents: s.allowedEvents,
      createdAt: s.createdAt,
    }));

    return NextResponse.json({ scanners: sanitizedScanners });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || sessionUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    const { name, email, phone, password, allowedEvents } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, Email, and Password are required.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    const existingUser = await dataService.findUserByEmail(cleanEmail);
    if (existingUser) {
      return NextResponse.json({ error: `An account with email "${cleanEmail}" already exists.` }, { status: 400 });
    }

    const passwordHash = await hashPassword(cleanPassword);
    const newScanner = await dataService.createUser({
      name: name.trim(),
      email: cleanEmail,
      phone: phone ? phone.trim() : '',
      passwordHash,
      role: 'SCANNER',
      allowedEvents: allowedEvents ? JSON.stringify(allowedEvents) : undefined,
    });

    await dataService.logAudit({
      userId: sessionUser.userId,
      userEmail: sessionUser.email,
      userRole: sessionUser.role,
      action: 'SCANNER_CREATE',
      details: `Created new scanner account "${name}" (${email})`,
    });

    return NextResponse.json({
      message: `Scanner account "${name}" created successfully.`,
      scanner: {
        id: newScanner.id,
        name: newScanner.name,
        email: newScanner.email,
        phone: newScanner.phone,
        role: newScanner.role,
        isActive: newScanner.isActive,
        allowedEvents: newScanner.allowedEvents,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || sessionUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    const { id, name, phone, allowedEvents, isActive, newPassword } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Scanner User ID is required.' }, { status: 400 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (allowedEvents !== undefined) updateData.allowedEvents = JSON.stringify(allowedEvents);
    if (isActive !== undefined) updateData.isActive = isActive;

    let updatedScanner = await dataService.updateScanner(id, updateData);

    if (newPassword && newPassword.trim()) {
      const passwordHash = await hashPassword(newPassword.trim());
      updatedScanner = await dataService.resetScannerPassword(id, passwordHash);
    }

    await dataService.logAudit({
      userId: sessionUser.userId,
      userEmail: sessionUser.email,
      userRole: sessionUser.role,
      action: 'SCANNER_UPDATE',
      details: `Updated scanner account ID ${id}: ${JSON.stringify(updateData)}${newPassword ? ' (Password Reset)' : ''}`,
    });

    return NextResponse.json({
      message: 'Scanner account updated successfully.',
      scanner: updatedScanner,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
