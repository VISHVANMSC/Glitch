import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { dataService } from '@/lib/dataService';

export async function POST(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || sessionUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    const { teamDbIds, result } = await req.json();
    if (!teamDbIds || !Array.isArray(teamDbIds) || teamDbIds.length === 0 || !result) {
      return NextResponse.json({ error: 'teamDbIds array and result tier are required.' }, { status: 400 });
    }

    const updatedTeams = [];
    for (const teamId of teamDbIds) {
      const updated = await dataService.updateTeamResult(teamId, result);
      if (updated) updatedTeams.push(updated);
    }

    return NextResponse.json({
      message: `Results updated for ${updatedTeams.length} team(s).`,
      count: updatedTeams.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
