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
      return NextResponse.json({ error: 'Team DB ID is required.' }, { status: 400 });
    }

    const teams = await dataService.getAllTeams();
    const team = teams.find((t: any) => t.id === teamDbId);
    if (!team) {
      return NextResponse.json({ error: 'Team not found.' }, { status: 404 });
    }

    if (team.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Cannot resend confirmation email for unapproved team.' }, { status: 400 });
    }

    const leaderEmail = team.leader?.email || team.members?.find((m: any) => m.isLeader)?.email;
    const leaderName = team.leader?.name || team.members?.find((m: any) => m.isLeader)?.name || team.teamName;

    if (!leaderEmail) {
      return NextResponse.json({ error: 'Leader email not found.' }, { status: 400 });
    }

    const result = await sendApprovalEmail({
      leaderEmail,
      leaderName,
      teamName: team.teamName,
      teamId: team.teamId || 'GL-01',
      qrCodeUrl: team.qrCodeUrl,
      barcodeUrl: team.barcodeUrl,
      members: team.members,
    });

    await dataService.logAudit({
      userId: sessionUser.userId,
      userEmail: sessionUser.email,
      userRole: sessionUser.role,
      action: 'EMAIL_RESEND',
      teamId: team.teamId || team.id,
      details: `Resent approval & QR email to "${leaderEmail}" for team "${team.teamName}"`,
    });

    return NextResponse.json({
      message: `Email sent successfully to ${leaderEmail}! If not seen in inbox, please advise participant to check Spam/Junk folder.`,
      result,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
