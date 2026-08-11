import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { dataService } from '@/lib/dataService';

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

    const updatedTeam = await dataService.regenerateTeamQr(teamDbId);
    if (!updatedTeam) {
      return NextResponse.json({ error: 'Team not found or has no assigned Team ID.' }, { status: 404 });
    }

    await dataService.logAudit({
      userId: sessionUser.userId,
      userEmail: sessionUser.email,
      userRole: sessionUser.role,
      action: 'QR_REGENERATED',
      teamId: updatedTeam.teamId || updatedTeam.id,
      details: `Regenerated QR & Barcode for team "${updatedTeam.teamName}" (${updatedTeam.teamId})`,
    });

    return NextResponse.json({
      message: `QR code & Barcode regenerated successfully for team "${updatedTeam.teamName}".`,
      team: updatedTeam,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
