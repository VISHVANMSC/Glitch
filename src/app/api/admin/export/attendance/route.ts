import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { dataService } from '@/lib/dataService';

export async function GET(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || sessionUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    const records = await dataService.getAllAttendanceRecords();

    // Generate CSV String
    const headers = [
      'Event Name',
      'Event Type',
      'Team ID',
      'Team Name',
      'Member Name',
      'Member Email',
      'Member Phone',
      'Department',
      'Attendance Status',
      'Scanned At (ISO)',
      'Scanner Operator',
      'Notes',
    ];

    const csvRows = [headers.join(',')];

    for (const r of records) {
      const row = [
        `"${r.event?.name || 'N/A'}"`,
        `"${r.event?.type || 'N/A'}"`,
        `"${r.team?.teamId || r.teamId || 'N/A'}"`,
        `"${r.team?.teamName || 'N/A'}"`,
        `"${r.member?.name || 'N/A'}"`,
        `"${r.member?.email || 'N/A'}"`,
        `"${r.member?.phone || 'N/A'}"`,
        `"${r.member?.department || 'N/A'}"`,
        `"${r.status}"`,
        `"${new Date(r.scannedAt).toISOString()}"`,
        `"${r.scanner?.name || r.scannerId || 'N/A'}"`,
        `"${r.notes || ''}"`,
      ];
      csvRows.push(row.join(','));
    }

    const csvData = csvRows.join('\n');

    return new Response(csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="glitch_attendance_report_${Date.now()}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
