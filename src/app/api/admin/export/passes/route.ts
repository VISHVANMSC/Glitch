import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { dataService } from '@/lib/dataService';
import { generateTeamQrAndBarcode } from '@/lib/qrcode';
import JSZip from 'jszip';

export async function GET(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const passType = searchParams.get('type') || 'ALL'; // 'ALL' | 'QR' | 'BARCODE'

    const allTeams = await dataService.getAllTeams();
    const approvedTeams = allTeams.filter((t: any) => t.status === 'APPROVED');

    if (approvedTeams.length === 0) {
      return NextResponse.json({ error: 'No approved teams available to export passes for.' }, { status: 404 });
    }

    const zip = new JSZip();
    const manifestRows: string[] = ['Team ID,Team Name,Leader Name,Leader Email,Members Count,Transaction UTR'];

    for (const team of approvedTeams) {
      const teamId = team.teamId || `TEAM_${team.id.substring(0, 6)}`;
      const cleanTeamName = team.teamName.replace(/[^a-zA-Z0-9_-]/g, '_');

      const generated = await generateTeamQrAndBarcode(teamId);
      const qrDataUrl = team.qrCodeUrl || generated.qrCodeUrl;
      const barcodeUrl = team.barcodeUrl || generated.barcodeUrl;

      // 1. Add QR Code image to ZIP
      if (passType === 'ALL' || passType === 'QR') {
        if (qrDataUrl && qrDataUrl.startsWith('data:image/png;base64,')) {
          const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, '');
          zip.file(`QR_Codes/${teamId}_${cleanTeamName}_QR.png`, base64Data, { base64: true });
        }
      }

      // 2. Add Barcode image to ZIP
      if (passType === 'ALL' || passType === 'BARCODE') {
        if (barcodeUrl && barcodeUrl.startsWith('data:image/svg+xml;base64,')) {
          const base64Data = barcodeUrl.replace(/^data:image\/svg\+xml;base64,/, '');
          zip.file(`Barcodes/${teamId}_${cleanTeamName}_Barcode.svg`, base64Data, { base64: true });
        } else if (barcodeUrl && barcodeUrl.startsWith('data:image/png;base64,')) {
          const base64Data = barcodeUrl.replace(/^data:image\/png;base64,/, '');
          zip.file(`Barcodes/${teamId}_${cleanTeamName}_Barcode.png`, base64Data, { base64: true });
        }
      }

      manifestRows.push(
        `"${teamId}","${team.teamName.replace(/"/g, '""')}","${(team.leader?.name || '').replace(/"/g, '""')}","${team.leader?.email || ''}",${team.members?.length || team.teamSize},"${team.transactionUtor}"`
      );
    }

    // Include CSV Manifest file in the zip
    zip.file('Team_Passes_Manifest.csv', manifestRows.join('\n'));

    // Generate ZIP content as ArrayBuffer
    const zipArrayBuffer = await zip.generateAsync({
      type: 'arraybuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `GLITCH_1.0_Bulk_Team_Passes_${timestamp}.zip`;

    return new Response(zipArrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    console.error('Bulk pass zip export error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate bulk pass zip' }, { status: 500 });
  }
}
