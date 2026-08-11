import QRCode from 'qrcode';

export interface QrBarcodeResult {
  qrCodeData: string;
  barcodeData: string;
  qrCodeUrl: string;
  barcodeUrl: string;
}

/**
 * Generates a unique QR code data string and barcode data string for a team ID.
 * e.g., teamId = "GL-01" -> qrCodeData = "GLITCH-TEAM:GL-01", barcodeData = "GL2026001"
 */
export async function generateTeamQrAndBarcode(teamId: string): Promise<QrBarcodeResult> {
  const cleanTeamId = teamId.trim().toUpperCase();
  const qrCodeData = `GLITCH-TEAM:${cleanTeamId}`;
  
  const numPart = cleanTeamId.replace(/[^0-9]/g, '').padStart(3, '0');
  const barcodeData = `GL2026${numPart}`;

  // 1. Generate QR Code Data URL (High quality PNG Data URL)
  const qrCodeUrl = await QRCode.toDataURL(qrCodeData, {
    errorCorrectionLevel: 'H',
    margin: 2,
    width: 300,
    color: {
      dark: '#1e1b4b',
      light: '#ffffff',
    },
  });

  // 2. Generate Barcode SVG Data URL
  const barcodeUrl = generateCode128SvgDataUrl(cleanTeamId);

  return {
    qrCodeData,
    barcodeData,
    qrCodeUrl,
    barcodeUrl,
  };
}

/**
 * Generates an inline SVG Data URL for Code128 barcode representation.
 */
function generateCode128SvgDataUrl(text: string): string {
  const width = 320;
  const height = 80;
  
  let barsHtml = '';
  let x = 20;
  const barWidth = 3;

  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    const pattern = (charCode * 17) % 64;
    for (let b = 0; b < 6; b++) {
      const isBlack = (pattern & (1 << b)) !== 0 || b % 2 === 0;
      const w = ((b % 3) + 1) * barWidth;
      if (isBlack) {
        barsHtml += `<rect x="${x}" y="10" width="${w}" height="45" fill="#000000"/>`;
      }
      x += w + 1;
    }
  }

  barsHtml += `<rect x="${x}" y="10" width="4" height="45" fill="#000000"/>`;
  x += 6;
  barsHtml += `<rect x="${x}" y="10" width="2" height="45" fill="#000000"/>`;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="100%" height="100%" fill="#ffffff"/>
      ${barsHtml}
      <text x="${width / 2}" y="70" font-family="monospace" font-size="14" font-weight="bold" fill="#1e1b4b" text-anchor="middle">${text}</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}
