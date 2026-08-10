import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { dataService } from '@/lib/dataService';
import { sendApprovalEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || sessionUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    const { teamDbId } = await req.json();
    if (!teamDbId) {
      return NextResponse.json({ error: 'Team DB ID is required' }, { status: 400 });
    }

    const updatedTeam = await dataService.approveTeam(teamDbId);
    if (!updatedTeam) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    if (updatedTeam.leader?.email) {
      await sendApprovalEmail({
        leaderEmail: updatedTeam.leader.email,
        leaderName: updatedTeam.leader.name,
        teamName: updatedTeam.teamName,
        teamId: updatedTeam.teamId || 'GL-01',
      });
    }

    return NextResponse.json({
      message: `Team "${updatedTeam.teamName}" approved successfully with ID ${updatedTeam.teamId}`,
      team: updatedTeam,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
