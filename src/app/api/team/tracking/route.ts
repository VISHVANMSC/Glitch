import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { dataService } from '@/lib/dataService';

export async function GET(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized. Login required.' }, { status: 401 });
    }

    if (sessionUser.role !== 'TEAM_LEADER' && sessionUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Team Leader or Admin access required.' }, { status: 403 });
    }

    const user = await dataService.findUserByEmail(sessionUser.email);
    if (!user) {
      return NextResponse.json({ error: 'User account not found.' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const targetTeamId = searchParams.get('teamId');

    let team: any = null;
    if (sessionUser.role === 'ADMIN' && targetTeamId) {
      const allTeams = await dataService.getAllTeams();
      team = allTeams.find((t: any) => t.id === targetTeamId || t.teamId === targetTeamId);
    } else {
      team = await dataService.getTeamByLeaderId(user.id);
    }

    if (!team) {
      return NextResponse.json({
        team: null,
        events: [],
        attendanceRecords: [],
        summary: [],
        isReadOnly: true,
      });
    }

    let events = await dataService.getEvents();
    const attendanceRecords = await dataService.getTeamAttendanceRecords(team.id, team.teamId);

    // Merge events from attendance records if not present in events list
    const knownEventIds = new Set(events.map((e: any) => e.id));
    for (const rec of attendanceRecords) {
      if (rec.event && !knownEventIds.has(rec.event.id)) {
        events.push(rec.event);
        knownEventIds.add(rec.event.id);
      }
    }

    // Fallback default events if none exist in system yet
    if (events.length === 0) {
      events = [
        {
          id: 'default-checkin-event',
          name: 'Venue Check-In',
          type: 'CHECK_IN',
          isActive: true,
        },
        {
          id: 'default-lunch-event',
          name: 'Lunch & Dining Pass',
          type: 'LUNCH',
          isActive: false,
        },
        {
          id: 'default-snacks-event',
          name: 'Refreshment & Snacks',
          type: 'REFRESHMENT',
          isActive: false,
        },
      ];
    }

    // Compute event tracking summaries for this team
    const summary = events.map((event: any) => {
      const eventRecords = attendanceRecords.filter(
        (r: any) => r.eventId === event.id || r.event?.type === event.type
      );
      const presentRecords = eventRecords.filter((r: any) => r.status === 'PRESENT');

      // Unique present member IDs
      const presentMemberIds = new Set(presentRecords.map((r: any) => r.memberId));
      const totalMembers = team.members?.length || 0;
      const scannedCount = presentMemberIds.size;

      let status: 'COMPLETED' | 'PARTIAL' | 'NOT_SCANNED' = 'NOT_SCANNED';
      if (scannedCount >= totalMembers && totalMembers > 0) {
        status = 'COMPLETED';
      } else if (scannedCount > 0) {
        status = 'PARTIAL';
      }

      // Latest scan time
      const latestScan = presentRecords.reduce((latest: Date | null, rec: any) => {
        const scanTime = new Date(rec.scannedAt);
        return !latest || scanTime > latest ? scanTime : latest;
      }, null);

      return {
        eventId: event.id,
        eventName: event.name,
        eventType: event.type,
        isActive: event.isActive,
        totalMembers,
        scannedCount,
        status,
        lastScannedAt: latestScan,
        records: eventRecords,
      };
    });

    return NextResponse.json({
      team: {
        id: team.id,
        teamId: team.teamId,
        teamName: team.teamName,
        members: team.members,
      },
      events,
      attendanceRecords,
      summary,
      isReadOnly: true,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

// Strictly enforce view-only policy on write methods
export async function POST() {
  return NextResponse.json(
    { error: 'Forbidden. Team Leaders have View-Only access. Modification of tracking data is prohibited.' },
    { status: 403 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Forbidden. Team Leaders have View-Only access. Modification of tracking data is prohibited.' },
    { status: 403 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Forbidden. Team Leaders have View-Only access. Modification of tracking data is prohibited.' },
    { status: 403 }
  );
}
