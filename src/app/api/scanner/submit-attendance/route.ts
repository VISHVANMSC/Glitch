import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { dataService } from '@/lib/dataService';

export async function POST(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || (sessionUser.role !== 'SCANNER' && sessionUser.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized. Scanner or Admin access required.' }, { status: 401 });
    }

    const { eventId, teamId, memberSelections, notes } = await req.json();

    if (!eventId || !teamId || !Array.isArray(memberSelections) || memberSelections.length === 0) {
      return NextResponse.json({ error: 'Missing required attendance submission payload.' }, { status: 400 });
    }

    // 1. Verify Active Event
    const events = await dataService.getEvents();
    const activeEvent = events.find((e) => e.id === eventId);
    if (!activeEvent || !activeEvent.isActive) {
      return NextResponse.json({ error: 'The selected scanning event is not active.' }, { status: 400 });
    }

    // 2. Duplicate Protection Check (if not allowed)
    if (!activeEvent.allowDuplicate) {
      const memberIds = memberSelections.map((m) => m.memberId);
      const existing = await dataService.checkDuplicateAttendance(eventId, memberIds);
      if (existing.length > 0 && sessionUser.role !== 'ADMIN') {
        // If already recorded and user is not admin override
        return NextResponse.json({
          error: `Attendance for this team has already been recorded for "${activeEvent.name}". Duplicate scans are not allowed.`,
          isDuplicate: true,
        }, { status: 409 });
      }
    }

    // 3. Record Attendance
    const savedRecords = await dataService.recordAttendance({
      eventId,
      teamId,
      memberSelections,
      scannerId: sessionUser.userId,
      notes,
    });

    const presentCount = memberSelections.filter((m) => m.present).length;
    const absentCount = memberSelections.filter((m) => !m.present).length;

    // 4. Log Audit Trail
    await dataService.logAudit({
      userId: sessionUser.userId,
      userEmail: sessionUser.email,
      userRole: sessionUser.role,
      action: 'ATTENDANCE_RECORDED',
      teamId,
      eventId,
      details: `Recorded attendance for Event "${activeEvent.name}": ${presentCount} Present, ${absentCount} Absent by scanner operator ${sessionUser.name}`,
    });

    return NextResponse.json({
      success: true,
      message: `Attendance confirmed for "${activeEvent.name}". (${presentCount} Present, ${absentCount} Absent)`,
      presentCount,
      absentCount,
      records: savedRecords,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
