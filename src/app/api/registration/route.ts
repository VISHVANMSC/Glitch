import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionUser } from '@/lib/auth';
import { dataService } from '@/lib/dataService';
import { sendRegistrationSubmittedEmail } from '@/lib/email';

const memberSchema = z.object({
  name: z.string().min(2, 'Member name is required'),
  email: z.string().email('Member email is required'),
  phone: z.string().min(10, 'Member phone is required'),
  college: z.string().min(2, 'College is required'),
  department: z.string().min(2, 'Department is required'),
  year: z.string().min(1, 'Year is required'),
  isLeader: z.boolean(),
});

const registrationSchema = z.object({
  teamName: z.string().min(2, 'Team name is mandatory'),
  teamSize: z.number().min(2, 'Minimum 2 members').max(3, 'Maximum 3 members'),
  paymentScreenshotUrl: z.string().min(1, 'Payment screenshot upload is required'),
  transactionUtor: z.string().min(4, 'Transaction UTR / Ref number is required'),
  members: z.array(memberSchema).min(2).max(3),
});

export async function POST(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized. Please log in as Team Leader.' }, { status: 401 });
    }

    const user = await dataService.findUserByEmail(sessionUser.email);
    if (!user) {
      return NextResponse.json({ error: 'User account not found.' }, { status: 404 });
    }

    const existingTeam = await dataService.getTeamByLeaderId(user.id);
    if (existingTeam) {
      return NextResponse.json(
        { error: 'You have already registered a team. Check your dashboard.' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const parsed = registrationSchema.parse(body);

    if (parsed.members.length !== parsed.teamSize) {
      return NextResponse.json(
        { error: `Team member details (${parsed.members.length}) must match selected team size (${parsed.teamSize})` },
        { status: 400 }
      );
    }

    // 1. Validate intra-team email uniqueness
    const emails = parsed.members.map((m) => m.email.trim().toLowerCase());
    if (new Set(emails).size !== emails.length) {
      return NextResponse.json(
        { error: 'Each person in the team must have a unique email address.' },
        { status: 400 }
      );
    }

    // 2. Validate intra-team phone uniqueness
    const phones = parsed.members.map((m) => m.phone.trim());
    if (new Set(phones).size !== phones.length) {
      return NextResponse.json(
        { error: 'Each person in the team must have a unique phone number.' },
        { status: 400 }
      );
    }

    // 3. Validate uniqueness across database & system records
    const uniqueCheck = await dataService.checkUniqueMembers(parsed.members, user.id);
    if (!uniqueCheck.success) {
      return NextResponse.json({ error: uniqueCheck.error }, { status: 400 });
    }

    // Ensure all team members inherit the leader's selected college
    const leaderMember = parsed.members.find((m) => m.isLeader) || parsed.members[0];
    const inheritedCollege = leaderMember.college;
    
    const validatedMembers = parsed.members.map((m) => ({
      ...m,
      college: inheritedCollege,
    }));

    const team = await dataService.createTeam({
      teamName: parsed.teamName,
      teamSize: parsed.teamSize,
      leaderId: user.id,
      paymentScreenshotUrl: parsed.paymentScreenshotUrl,
      transactionUtor: parsed.transactionUtor,
      members: validatedMembers,
    });

    // Send automatic email notification (non-blocking catch)
    sendRegistrationSubmittedEmail({
      leaderEmail: user.email,
      leaderName: user.name,
      teamName: team.teamName,
    }).catch((err) => {
      console.error('Failed to send registration submitted email:', err);
    });

    return NextResponse.json({
      message: 'Registration submitted successfully. Pending admin approval.',
      team,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || error.message }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
