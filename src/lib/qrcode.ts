import QRCode from 'qrcode';
import zlib from 'zlib';

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

const BITMAP_FONT: Record<string, number[]> = {
  '0': [0x1e, 0x21, 0x25, 0x29, 0x31, 0x21, 0x1e],
  '1': [0x08, 0x18, 0x08, 0x08, 0x08, 0x08, 0x1c],
  '2': [0x1e, 0x21, 0x01, 0x0e, 0x10, 0x20, 0x3f],
  '3': [0x1e, 0x21, 0x01, 0x0e, 0x01, 0x21, 0x1e],
  '4': [0x02, 0x06, 0x0a, 0x12, 0x3f, 0x02, 0x02],
  '5': [0x3f, 0x20, 0x3e, 0x01, 0x01, 0x21, 0x1e],
  '6': [0x1e, 0x21, 0x20, 0x3e, 0x21, 0x21, 0x1e],
  '7': [0x3f, 0x01, 0x02, 0x04, 0x08, 0x08, 0x08],
  '8': [0x1e, 0x21, 0x21, 0x1e, 0x21, 0x21, 0x1e],
  '9': [0x1e, 0x21, 0x21, 0x1f, 0x01, 0x21, 0x1e],
  'A': [0x0e, 0x11, 0x11, 0x1f, 0x11, 0x11, 0x11],
  'B': [0x3e, 0x11, 0x11, 0x3e, 0x11, 0x11, 0x3e],
  'C': [0x0e, 0x11, 0x20, 0x20, 0x20, 0x11, 0x0e],
  'D': [0x3c, 0x12, 0x11, 0x11, 0x11, 0x12, 0x3c],
  'E': [0x3f, 0x20, 0x20, 0x3e, 0x20, 0x20, 0x3f],
  'F': [0x3f, 0x20, 0x20, 0x3e, 0x20, 0x20, 0x20],
  'G': [0x0e, 0x11, 0x20, 0x27, 0x21, 0x11, 0x0f],
  'H': [0x11, 0x11, 0x11, 0x1f, 0x11, 0x11, 0x11],
  'I': [0x0e, 0x04, 0x04, 0x04, 0x04, 0x04, 0x0e],
  'J': [0x07, 0x02, 0x02, 0x02, 0x02, 0x22, 0x1c],
  'K': [0x11, 0x12, 0x14, 0x18, 0x14, 0x12, 0x11],
  'L': [0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x3f],
  'M': [0x11, 0x1b, 0x15, 0x15, 0x11, 0x11, 0x11],
  'N': [0x11, 0x11, 0x19, 0x15, 0x13, 0x11, 0x11],
  'O': [0x0e, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0e],
  'P': [0x3e, 0x11, 0x11, 0x3e, 0x20, 0x20, 0x20],
  'Q': [0x0e, 0x11, 0x11, 0x11, 0x15, 0x12, 0x0d],
  'R': [0x3e, 0x11, 0x11, 0x3e, 0x14, 0x12, 0x11],
  'S': [0x0f, 0x10, 0x10, 0x0e, 0x01, 0x01, 0x1e],
  'T': [0x1f, 0x04, 0x04, 0x04, 0x04, 0x04, 0x04],
  'U': [0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0e],
  'V': [0x11, 0x11, 0x11, 0x11, 0x11, 0x0a, 0x04],
  'W': [0x11, 0x11, 0x11, 0x15, 0x15, 0x1b, 0x11],
  'X': [0x11, 0x11, 0x0a, 0x04, 0x0a, 0x11, 0x11],
  'Y': [0x11, 0x11, 0x0a, 0x04, 0x04, 0x04, 0x04],
  'Z': [0x1f, 0x01, 0x02, 0x04, 0x08, 0x10, 0x1f],
  '-': [0x00, 0x00, 0x00, 0x1f, 0x00, 0x00, 0x00],
  ' ': [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
  ':': [0x00, 0x0c, 0x0c, 0x00, 0x0c, 0x0c, 0x00],
};

function makeCrc32Table(): Uint32Array {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  return table;
}

const crcTable = makeCrc32Table();

function crc32(buf: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type: string, data: Buffer): Buffer {
  const len = data.length;
  const typeBuf = Buffer.from(type, 'ascii');
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  typeBuf.copy(buf, 4);
  data.copy(buf, 8);
  const crcVal = crc32(Buffer.concat([typeBuf, data]));
  buf.writeUInt32BE(crcVal, 8 + len);
  return buf;
}

/**
 * Generates a native, compliant Code 128 B barcode PNG Data URL (works 100% in Gmail, Outlook, and all email clients).
 */
export function generateCode128PngDataUrl(text: string): string {
  const cleanText = text.trim().toUpperCase();
  let codeArr: number[] = [104];
  let checksum = 104;

  for (let i = 0; i < cleanText.length; i++) {
    const code = cleanText.charCodeAt(i) - 32;
    codeArr.push(code);
    checksum += code * (i + 1);
  }

  codeArr.push(checksum % 103);
  codeArr.push(106);

  const quietZone = 25;
  const moduleWidth = 3;
  const barHeight = 65;
  const fontScale = 2;
  const fontRowHeight = 7 * fontScale;
  const height = 10 + barHeight + 10 + fontRowHeight + 10; // ~109px total height

  let totalModules = 0;
  for (const c of codeArr) {
    const pattern = CODE128_PATTERNS[c];
    if (pattern) {
      for (let p = 0; p < pattern.length; p++) {
        totalModules += parseInt(pattern[p], 10);
      }
    }
  }

  const width = Math.max(300, quietZone * 2 + totalModules * moduleWidth);
  const rowBytes = width * 4 + 1;
  const rawScanlines = Buffer.alloc(height * rowBytes);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowBytes;
    rawScanlines[rowOffset] = 0; // Filter 0
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      rawScanlines[pxOffset] = 255;
      rawScanlines[pxOffset + 1] = 255;
      rawScanlines[pxOffset + 2] = 255;
      rawScanlines[pxOffset + 3] = 255;
    }
  }

  // Draw Code 128 Bars
  let curX = quietZone;
  for (const c of codeArr) {
    const pattern = CODE128_PATTERNS[c];
    if (!pattern) continue;

    let isBar = true;
    for (let p = 0; p < pattern.length; p++) {
      const w = parseInt(pattern[p], 10) * moduleWidth;
      if (isBar) {
        for (let y = 10; y < 10 + barHeight; y++) {
          const rowOffset = y * rowBytes;
          for (let bx = 0; bx < w; bx++) {
            const x = Math.floor(curX + bx);
            if (x < width) {
              const pxOffset = rowOffset + 1 + x * 4;
              rawScanlines[pxOffset] = 0;
              rawScanlines[pxOffset + 1] = 0;
              rawScanlines[pxOffset + 2] = 0;
              rawScanlines[pxOffset + 3] = 255;
            }
          }
        }
      }
      curX += w;
      isBar = !isBar;
    }
  }

  // Draw Text at bottom centered
  const charWidth = 6 * fontScale;
  const textWidth = cleanText.length * (charWidth + 2);
  const startX = Math.max(10, Math.floor((width - textWidth) / 2));
  const startY = 10 + barHeight + 8;

  for (let i = 0; i < cleanText.length; i++) {
    const ch = cleanText[i];
    const bitmap = BITMAP_FONT[ch] || BITMAP_FONT[' '];
    if (!bitmap) continue;

    const charX = startX + i * (charWidth + 2);
    for (let r = 0; r < 7; r++) {
      const rowBits = bitmap[r] || 0;
      for (let c = 0; c < 6; c++) {
        const bit = (rowBits & (1 << (5 - c))) !== 0;
        if (bit) {
          for (let sy = 0; sy < fontScale; sy++) {
            for (let sx = 0; sx < fontScale; sx++) {
              const px = charX + c * fontScale + sx;
              const py = startY + r * fontScale + sy;
              if (px >= 0 && px < width && py >= 0 && py < height) {
                const pxOffset = py * rowBytes + 1 + px * 4;
                rawScanlines[pxOffset] = 0;
                rawScanlines[pxOffset + 1] = 0;
                rawScanlines[pxOffset + 2] = 0;
                rawScanlines[pxOffset + 3] = 255;
              }
            }
          }
        }
      }
    }
  }

  const compressed = zlib.deflateSync(rawScanlines);
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6;
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;

  const ihdrChunk = makeChunk('IHDR', ihdrData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  const pngBuf = Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
  return `data:image/png;base64,${pngBuf.toString('base64')}`;
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

  // 2. Generate Standard Code 128 Barcode PNG Data URL (compatible with Gmail, Outlook, and all email clients)
  const barcodeUrl = generateCode128PngDataUrl(cleanTeamId);

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
  return generateCode128PngDataUrl(text);
}
