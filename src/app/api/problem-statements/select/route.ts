import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { dataService } from '@/lib/dataService';
import { sendPsSelectionEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const user = await dataService.findUserByEmail(sessionUser.email);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const team = await dataService.getTeamByLeaderId(user.id);
    if (!team) {
      return NextResponse.json({ error: 'No team registration found.' }, { status: 400 });
    }

    if (team.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Your registration is not approved yet. Only approved teams can select a Problem Statement.' }, { status: 403 });
    }

    if (team.selectedPsId) {
      return NextResponse.json({ error: 'Your team has already selected a Problem Statement. Problem statement choices are permanently locked.' }, { status: 400 });
    }

    const windowInfo = await dataService.getSelectionWindow();
    const now = new Date();
    const isExpired = windowInfo.endTime ? new Date(windowInfo.endTime) < now : false;

    if (!windowInfo.isOpen || isExpired) {
      return NextResponse.json({ error: 'Problem Statement selection window is currently closed.' }, { status: 403 });
    }

    const { psId } = await req.json();
    if (!psId) {
      return NextResponse.json({ error: 'PS ID is required' }, { status: 400 });
    }

    const allPs = await dataService.getAllProblemStatements();
    const selectedPs = allPs.find((p) => p.id === psId);
    if (!selectedPs) {
      return NextResponse.json({ error: 'Selected Problem Statement not found' }, { status: 404 });
    }

    const updatedTeam = await dataService.selectProblemStatement(team.id, psId);

    // Send confirmation email
    await sendPsSelectionEmail({
      leaderEmail: user.email,
      leaderName: user.name,
      teamName: team.teamName,
      teamId: team.teamId || 'GL-00',
      psNumber: selectedPs.psNumber,
      psTitle: selectedPs.title,
      driveLink: selectedPs.driveLink,
    });

    return NextResponse.json({
      message: `Problem Statement ${selectedPs.psNumber} locked successfully! Email sent to ${user.email}. If you don't see it in your inbox, please check your Spam/Junk folder.`,
      team: updatedTeam,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
