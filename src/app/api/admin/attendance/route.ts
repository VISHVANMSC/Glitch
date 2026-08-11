import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { dataService } from '@/lib/dataService';

export async function GET(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || sessionUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');

    const teams = await dataService.getAllTeams();
    const approvedTeams = teams.filter((t: any) => t.status === 'APPROVED');
    const allMembers = approvedTeams.flatMap((t: any) => t.members || []);

    const attendanceRecords = await dataService.getAllAttendanceRecords();
    const events = await dataService.getEvents();

    let filteredRecords = attendanceRecords;
    if (eventId) {
      filteredRecords = attendanceRecords.filter((r: any) => r.eventId === eventId);
    }

    // Present members set
    const checkedInMemberIds = new Set(
      attendanceRecords
        .filter((r: any) => r.status === 'PRESENT')
        .map((r: any) => r.memberId)
    );

    // Present count per team
    const teamStats = approvedTeams.map((team: any) => {
      const teamRecords = filteredRecords.filter((r: any) => r.teamId === team.id);
      const isScanned = teamRecords.length > 0;
      const presentCount = teamRecords.filter((r: any) => r.status === 'PRESENT').length;
      return {
        id: team.id,
        teamId: team.teamId,
        teamName: team.teamName,
        totalMembers: team.members.length,
        isScanned,
        presentCount,
        absentCount: team.members.length - presentCount,
      };
    });

    return NextResponse.json({
      summary: {
        totalTeams: teams.length,
        approvedTeams: approvedTeams.length,
        pendingTeams: teams.filter((t: any) => t.status === 'PENDING').length,
        totalMembers: allMembers.length,
        checkedInMembers: checkedInMemberIds.size,
        absentMembersCount: allMembers.length - checkedInMemberIds.size,
      },
      events,
      teamStats,
      records: filteredRecords,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  // Manual Attendance Correction by Admin
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || sessionUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    const { eventId, teamId, memberId, status, notes } = await req.json();

    if (!eventId || !teamId || !memberId || !status) {
      return NextResponse.json({ error: 'Event ID, Team ID, Member ID, and Status are required.' }, { status: 400 });
    }

    const rec = await dataService.recordAttendance({
      eventId,
      teamId,
      memberSelections: [{ memberId, present: status === 'PRESENT' }],
      scannerId: sessionUser.userId,
      notes: notes ? `Admin Correction: ${notes}` : 'Manual Admin Override',
    });

    await dataService.logAudit({
      userId: sessionUser.userId,
      userEmail: sessionUser.email,
      userRole: sessionUser.role,
      action: 'ATTENDANCE_MANUAL_OVERRIDE',
      teamId,
      memberId,
      eventId,
      details: `Admin manually set attendance status to "${status}" for member ${memberId}. Note: ${notes || 'N/A'}`,
    });

    return NextResponse.json({
      message: `Attendance updated to ${status} by Admin.`,
      record: rec,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
