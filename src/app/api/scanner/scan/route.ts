import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { dataService } from '@/lib/dataService';

export async function POST(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || (sessionUser.role !== 'SCANNER' && sessionUser.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized. Scanner or Admin access required.' }, { status: 401 });
    }

    const { code, eventId } = await req.json();
    if (!code || !code.trim()) {
      return NextResponse.json({ error: 'QR Code or Barcode input is required.' }, { status: 400 });
    }
    if (!eventId) {
      return NextResponse.json({ error: 'Active scanning event must be selected.' }, { status: 400 });
    }

    // 1. Find event and check active state
    const events = await dataService.getEvents();
    const activeEvent = events.find((e) => e.id === eventId);
    if (!activeEvent) {
      return NextResponse.json({ error: 'Selected event not found.' }, { status: 404 });
    }
    if (!activeEvent.isActive) {
      return NextResponse.json({ error: `Event "${activeEvent.name}" is currently inactive.` }, { status: 400 });
    }

    // 2. Find Team
    const team = await dataService.findTeamByCode(code);
    if (!team) {
      return NextResponse.json({ error: `No registered team found matching code "${code}".` }, { status: 404 });
    }

    // 3. Verify Team Status
    if (team.status !== 'APPROVED') {
      return NextResponse.json({
        error: `Team "${team.teamName}" is currently ${team.status}. Only APPROVED teams are allowed to check in.`,
        isUnapproved: true,
      }, { status: 400 });
    }

    // 4. Duplicate scan check for members
    const memberIds = team.members.map((m: any) => m.id);
    const existingRecords = await dataService.checkDuplicateAttendance(eventId, memberIds);
    const isAlreadyScanned = existingRecords.length > 0;

    if (isAlreadyScanned && !activeEvent.allowDuplicate) {
      return NextResponse.json({
        error: `DUPLICATE SCAN BLOCKED! Team "${team.teamName}" (${team.teamId}) has ALREADY checked in for event "${activeEvent.name}". Duplicate scans are strictly prohibited.`,
        isDuplicate: true,
        team: {
          id: team.id,
          teamId: team.teamId,
          teamName: team.teamName,
          teamSize: team.teamSize,
        },
      }, { status: 409 });
    }

    return NextResponse.json({
      success: true,
      event: activeEvent,
      team: {
        id: team.id,
        teamId: team.teamId,
        teamName: team.teamName,
        teamSize: team.teamSize,
        leaderName: team.leader?.name || team.members.find((m: any) => m.isLeader)?.name || 'N/A',
        qrCodeUrl: team.qrCodeUrl,
        barcodeUrl: team.barcodeUrl,
      },
      members: team.members.map((m: any) => {
        const existing = existingRecords.find((r: any) => r.memberId === m.id);
        return {
          id: m.id,
          name: m.name,
          email: m.email,
          phone: m.phone,
          college: m.college,
          department: m.department,
          isLeader: m.isLeader,
          // Default: selected/present (true) unless previously recorded
          selected: existing ? existing.status === 'PRESENT' : true,
          previousStatus: existing ? existing.status : null,
          scannedAt: existing ? existing.scannedAt : null,
        };
      }),
      isAlreadyScanned,
      allowDuplicate: activeEvent.allowDuplicate,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
