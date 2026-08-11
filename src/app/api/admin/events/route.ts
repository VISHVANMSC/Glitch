import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { dataService } from '@/lib/dataService';

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || sessionUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    const events = await dataService.getEvents();
    return NextResponse.json({ events });
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

    const { name, type, startDate, endDate, isActive, allowDuplicate, description } = await req.json();

    if (!name || !type || !startDate || !endDate) {
      return NextResponse.json({ error: 'Name, Type, Start Date, and End Date are required.' }, { status: 400 });
    }

    const newEvent = await dataService.createEvent({
      name,
      type,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isActive: Boolean(isActive),
      allowDuplicate: Boolean(allowDuplicate),
      description,
    });

    await dataService.logAudit({
      userId: sessionUser.userId,
      userEmail: sessionUser.email,
      userRole: sessionUser.role,
      action: 'EVENT_CREATE',
      eventId: newEvent.id,
      details: `Created scanning event "${name}" (${type})`,
    });

    return NextResponse.json({
      message: `Event "${name}" created successfully.`,
      event: newEvent,
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

    const { id, name, type, startDate, endDate, isActive, allowDuplicate, description } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Event ID is required.' }, { status: 400 });
    }

    const updatePayload: any = {};
    if (name !== undefined) updatePayload.name = name;
    if (type !== undefined) updatePayload.type = type;
    if (startDate !== undefined) updatePayload.startDate = new Date(startDate);
    if (endDate !== undefined) updatePayload.endDate = new Date(endDate);
    if (isActive !== undefined) updatePayload.isActive = Boolean(isActive);
    if (allowDuplicate !== undefined) updatePayload.allowDuplicate = Boolean(allowDuplicate);
    if (description !== undefined) updatePayload.description = description;

    const updatedEvent = await dataService.updateEvent(id, updatePayload);

    await dataService.logAudit({
      userId: sessionUser.userId,
      userEmail: sessionUser.email,
      userRole: sessionUser.role,
      action: 'EVENT_UPDATE',
      eventId: id,
      details: `Updated scanning event ID ${id}: ${JSON.stringify(updatePayload)}`,
    });

    return NextResponse.json({
      message: 'Event updated successfully.',
      event: updatedEvent,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || sessionUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Event ID is required.' }, { status: 400 });
    }

    await dataService.deleteEvent(id);

    await dataService.logAudit({
      userId: sessionUser.userId,
      userEmail: sessionUser.email,
      userRole: sessionUser.role,
      action: 'EVENT_DELETE',
      eventId: id,
      details: `Deleted event ID ${id}`,
    });

    return NextResponse.json({ message: 'Event deleted successfully.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
