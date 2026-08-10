import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { dataService } from '@/lib/dataService';
import { sendRejectionEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || sessionUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    const { teamDbId, rejectionReason } = await req.json();
    if (!teamDbId || !rejectionReason) {
      return NextResponse.json({ error: 'Team ID and Rejection Reason are required.' }, { status: 400 });
    }

    const updatedTeam = await dataService.rejectTeam(teamDbId, rejectionReason);
    if (!updatedTeam) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    if (updatedTeam.leader?.email) {
      await sendRejectionEmail({
        leaderEmail: updatedTeam.leader.email,
        leaderName: updatedTeam.leader.name,
        teamName: updatedTeam.teamName,
        rejectionReason,
      });
    }

    return NextResponse.json({
      message: `Team "${updatedTeam.teamName}" rejected. Rejection reason dispatched to leader.`,
      team: updatedTeam,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
