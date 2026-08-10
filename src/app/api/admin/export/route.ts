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
    const exportType = searchParams.get('type') || 'registrations';

    const teams = await dataService.getAllTeams();

    if (exportType === 'participants') {
      // Overall Participants Level Export (Row per team member)
      const headers = [
        'Participant Name',
        'Role',
        'Email',
        'Phone',
        'College / Institution',
        'Department',
        'Academic Year',
        'Team ID',
        'Team Name',
        'Registration Status',
        'Payment UTR',
        'Selected PS',
        'Result Tier',
        'Registration Date',
      ];

      const rows: string[] = [];
      teams.forEach((t) => {
        if (t.members && t.members.length > 0) {
          t.members.forEach((m: any) => {
            rows.push(
              [
                `"${(m.name || '').replace(/"/g, '""')}"`,
                `"${m.isLeader ? 'Team Leader' : 'Team Member'}"`,
                `"${(m.email || '').replace(/"/g, '""')}"`,
                `"${(m.phone || '').replace(/"/g, '""')}"`,
                `"${(m.college || '').replace(/"/g, '""')}"`,
                `"${(m.department || '').replace(/"/g, '""')}"`,
                `"${(m.year || '').replace(/"/g, '""')}"`,
                `"${t.teamId || 'Unassigned'}"`,
                `"${t.teamName.replace(/"/g, '""')}"`,
                `"${t.status}"`,
                `"${t.transactionUtor.replace(/"/g, '""')}"`,
                `"${t.selectedPs?.psNumber || 'None'}"`,
                `"${t.result}"`,
                `"${new Date(t.createdAt).toISOString()}"`,
              ].join(',')
            );
          });
        }
      });

      const csvContent = [headers.join(','), ...rows].join('\n');
      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="glitch_overall_participants_${Date.now()}.csv"`,
        },
      });
    }

    // Default: Team Registrations Summary Export
    const headers = [
      'Team ID',
      'Team Name',
      'Registration Status',
      'Payment Status',
      'Team Size',
      'Leader Name',
      'Leader Email',
      'Leader Phone',
      'College',
      'Selected PS',
      'Transaction UTR',
      'Result Tier',
      'Created At',
    ];

    const rows = teams.map((t) => {
      const leader = t.members?.find((m: any) => m.isLeader) || t.members?.[0] || {};
      return [
        `"${t.teamId || 'Unassigned'}"`,
        `"${t.teamName.replace(/"/g, '""')}"`,
        `"${t.status}"`,
        `"${t.paymentStatus || t.status}"`,
        `"${t.teamSize}"`,
        `"${(leader.name || t.leader?.name || '').replace(/"/g, '""')}"`,
        `"${(leader.email || t.leader?.email || '').replace(/"/g, '""')}"`,
        `"${(leader.phone || t.leader?.phone || '').replace(/"/g, '""')}"`,
        `"${(leader.college || '').replace(/"/g, '""')}"`,
        `"${t.selectedPs?.psNumber || 'None'}"`,
        `"${t.transactionUtor.replace(/"/g, '""')}"`,
        `"${t.result}"`,
        `"${new Date(t.createdAt).toISOString()}"`,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="glitch_team_registrations_${Date.now()}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
