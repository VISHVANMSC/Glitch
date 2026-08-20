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

    // Log Audit Trail
    await dataService.logAudit({
      userId: sessionUser.userId,
      userEmail: sessionUser.email,
      userRole: sessionUser.role,
      action: 'TEAM_APPROVE',
      teamId: updatedTeam.teamId || updatedTeam.id,
      details: `Approved team "${updatedTeam.teamName}" and generated Team ID ${updatedTeam.teamId}`,
    });

    if (updatedTeam.leader?.email) {
      sendApprovalEmail({
        leaderEmail: updatedTeam.leader.email,
        leaderName: updatedTeam.leader.name,
        teamName: updatedTeam.teamName,
        teamId: updatedTeam.teamId || 'GL-01',
        qrCodeUrl: updatedTeam.qrCodeUrl,
        barcodeUrl: updatedTeam.barcodeUrl,
        members: updatedTeam.members,
      }).catch((err) => {
        console.error('Failed to send approval email:', err);
      });
    }

    return NextResponse.json({
      message: `Team "${updatedTeam.teamName}" approved successfully with ID ${updatedTeam.teamId}. Confirmation email sent to ${updatedTeam.leader?.email || 'leader'}. (If not found in inbox, ask participant to check Spam/Junk folder).`,
      team: updatedTeam,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
