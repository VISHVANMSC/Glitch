import QRCode from 'qrcode';

export interface QrBarcodeResult {
  qrCodeData: string;
  barcodeData: string;
  qrCodeUrl: string;
  barcodeUrl: string;
}

// Complete Code 128 Pattern Table (Patterns 0 to 106)
const CODE128_PATTERNS = [
  '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312',
  '132212', '221213', '221312', '231212', '112232', '122132', '122231', '113222',
  '123122', '123221', '223211', '221132', '221231', '213212', '223112', '312131',
  '311222', '321122', '321221', '312212', '322112', '322211', '212123', '212321',
  '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313',
  '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121',
  '313121', '211331', '231131', '213113', '213311', '213131', '311123', '311321',
  '331121', '312113', '312311', '332111', '314111', '221411', '431111', '111224',
  '111422', '121124', '121421', '141122', '141221', '112214', '112412', '122114',
  '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111',
  '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112',
  '421211', '212141', '214121', '412121', '111143', '111341', '131141', '114113',
  '114311', '411113', '411311', '113141', '114131', '311141', '411131', '211412',
  '211214', '211232', '2331112'
];

/**
 * Generates a unique QR code data string and barcode data string for a team ID.
 * e.g., teamId = "GL-01" -> qrCodeData = "GLITCH-TEAM:GL-01", barcodeData = "GL2026001"
 */
export async function generateTeamQrAndBarcode(teamId: string): Promise<QrBarcodeResult> {
  const cleanTeamId = teamId.trim().toUpperCase();
  const qrCodeData = `GLITCH-TEAM:${cleanTeamId}`;
  
  const numPart = cleanTeamId.replace(/[^0-9]/g, '').padStart(3, '0');
  const barcodeData = `GL2026${numPart}`;

  // 1. Generate High-Res Pure Black & White QR Code PNG Data URL
  const qrCodeUrl = await QRCode.toDataURL(qrCodeData, {
    errorCorrectionLevel: 'H',
    margin: 2,
    width: 360,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  });

  // 2. Generate Standard Code 128 Barcode SVG Data URL
  const barcodeUrl = generateCode128SvgDataUrl(cleanTeamId);

  return {
    qrCodeData,
    barcodeData,
    qrCodeUrl,
    barcodeUrl,
  };
}

/**
 * Generates a compliant Code 128 B barcode SVG Data URL with exact bars & spaces.
 */
export function generateCode128SvgDataUrl(text: string): string {
  const cleanText = text.trim().toUpperCase();
  let codeArr: number[] = [104]; // Code 128 Start B
  let checksum = 104;

  for (let i = 0; i < cleanText.length; i++) {
    const code = cleanText.charCodeAt(i) - 32;
    codeArr.push(code);
    checksum += code * (i + 1);
  }

  codeArr.push(checksum % 103);
  codeArr.push(106); // Stop Symbol

  let moduleX = 15;
  let svgBars = '';
  const barHeight = 55;
  const moduleWidth = 2.2;

  for (const c of codeArr) {
    const pattern = CODE128_PATTERNS[c];
    if (!pattern) continue;

    let isBar = true;
    for (let p = 0; p < pattern.length; p++) {
      const width = parseInt(pattern[p], 10) * moduleWidth;
      if (isBar) {
        svgBars += `<rect x="${moduleX}" y="10" width="${width}" height="${barHeight}" fill="#000000"/>`;
      }
      moduleX += width;
      isBar = !isBar;
    }
  }

  const totalWidth = Math.ceil(moduleX + 15);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="85" viewBox="0 0 ${totalWidth} 85"><rect width="100%" height="100%" fill="#ffffff"/>${svgBars}<text x="${totalWidth / 2}" y="76" font-family="monospace" font-size="13" font-weight="bold" fill="#000000" text-anchor="middle">${cleanText}</text></svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}
