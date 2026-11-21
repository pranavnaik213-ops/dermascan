import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.resolve(__dirname, '..', 'public');

// CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(typeStr, dataBuf) {
  const typeBuf = Buffer.from(typeStr, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(dataBuf.length, 0);

  const crcBuf = Buffer.alloc(4);
  const combined = Buffer.concat([typeBuf, dataBuf]);
  crcBuf.writeUInt32BE(crc32(combined), 0);

  return Buffer.concat([lenBuf, typeBuf, dataBuf, crcBuf]);
}

function createPng(width, height, pixelFn) {
  // Signature
  const sig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  // IHDR: width(4), height(4), bitDepth(1)=8, colorType(1)=6(RGBA), comp(1)=0, filter(1)=0, interlace(1)=0
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Scanlines with filter byte 0x00
  const rawScanlineLen = 1 + width * 4;
  const rawData = Buffer.alloc(rawScanlineLen * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rawScanlineLen;
    rawData[rowOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = pixelFn(x, y, width, height);
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

// 1. Generate Apple Touch Icon (180x180)
console.log('Generating apple-touch-icon.png (180x180)...');
const appleIcon = createPng(180, 180, (x, y, w, h) => {
  // Rounded corner mask
  const radius = 36;
  const dx = x < radius ? radius - x : (x > w - 1 - radius ? x - (w - 1 - radius) : 0);
  const dy = y < radius ? radius - y : (y > h - 1 - radius ? y - (h - 1 - radius) : 0);
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist > radius) return [0, 0, 0, 0];

  // Teal gradient background: from (13, 148, 136) #0d9488 to (15, 118, 110) #0f766e
  const t = (x + y) / (w + h);
  let r = Math.round(13 + t * (15 - 13));
  let g = Math.round(148 + t * (118 - 148));
  let b = Math.round(136 + t * (110 - 136));

  // Center paw/cross emblem shape
  const cx = w / 2;
  const cy = h / 2;

  // Medical Cross center
  const armWidth = 14;
  const armLen = 38;
  const inHoriz = Math.abs(y - cy) <= armWidth && Math.abs(x - cx) <= armLen;
  const inVert = Math.abs(x - cx) <= armWidth && Math.abs(y - cy) <= armLen;

  // Paw pad circles around
  const d1 = Math.hypot(x - (cx - 24), y - (cy - 38));
  const d2 = Math.hypot(x - (cx + 24), y - (cy - 38));
  const d3 = Math.hypot(x - cx, y - (cy - 48));

  if (inHoriz || inVert || d1 <= 12 || d2 <= 12 || d3 <= 12) {
    return [255, 255, 255, 255];
  }

  return [r, g, b, 255];
});

fs.writeFileSync(path.join(PUBLIC_DIR, 'apple-touch-icon.png'), appleIcon);

// 2. Generate Favicon (32x32) as ICO
console.log('Generating favicon.ico (32x32)...');
const png32 = createPng(32, 32, (x, y, w, h) => {
  const cx = w / 2;
  const cy = h / 2;
  const dist = Math.hypot(x - cx, y - cy);
  if (dist > 15) return [0, 0, 0, 0]; // Circle badge

  // Medical cross
  const inH = Math.abs(y - cy) <= 3 && Math.abs(x - cx) <= 8;
  const inV = Math.abs(x - cx) <= 3 && Math.abs(y - cy) <= 8;
  if (inH || inV) return [255, 255, 255, 255];

  return [13, 148, 136, 255]; // Teal background
});

// Create standard ICO file embedding 32x32 PNG
// ICO header (6 bytes): 0, 1 (type icon), 1 (count)
const icoHeader = Buffer.from([0, 0, 1, 0, 1, 0]);
// Directory entry (16 bytes): width, height, colors(0), reserved(0), planes(1,0), bpp(32,0), size(4 bytes), offset(4 bytes)
const icoDir = Buffer.alloc(16);
icoDir[0] = 32; // Width
icoDir[1] = 32; // Height
icoDir[2] = 0;  // Palette count
icoDir[3] = 0;  // Reserved
icoDir.writeUInt16LE(1, 4); // Color planes
icoDir.writeUInt16LE(32, 6); // Bits per pixel
icoDir.writeUInt32LE(png32.length, 8); // Image data size
icoDir.writeUInt32LE(22, 12); // Offset = 6 + 16 = 22

const icoFile = Buffer.concat([icoHeader, icoDir, png32]);
fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon.ico'), icoFile);

// 3. Generate Social OG Image (1200x630)
console.log('Generating og-image.png (1200x630)...');
const ogPng = createPng(1200, 630, (x, y, w, h) => {
  // Diagonal Dark Teal -> Slate Gradient
  const t = (x / w) * 0.7 + (y / h) * 0.3;
  // Gradient from [4, 47, 46] to [15, 23, 42]
  let r = Math.round(4 + t * (15 - 4));
  let g = Math.round(47 + t * (23 - 47));
  let b = Math.round(46 + t * (42 - 46));

  // Glowing ring around (1000, 315)
  const ringDist = Math.hypot(x - 1000, y - 315);
  if (Math.abs(ringDist - 240) < 4 || Math.abs(ringDist - 160) < 3) {
    return [45, 212, 191, 220]; // Teal accent ring
  }
  if (ringDist < 120) {
    const glowT = (1 - ringDist / 120) * 0.35;
    r = Math.round(r + glowT * (45 - r));
    g = Math.round(g + glowT * (212 - g));
    b = Math.round(b + glowT * (191 - b));
  }

  // Accent bar on bottom
  if (y >= 622) {
    return [45, 212, 191, 255];
  }

  // Accent badge box on top-left (DermaScan emblem icon)
  if (x >= 90 && x <= 160 && y >= 90 && y <= 160) {
    const bx = x - 125;
    const by = y - 125;
    if (Math.abs(bx) <= 8 && Math.abs(by) <= 22) return [255, 255, 255, 255];
    if (Math.abs(by) <= 8 && Math.abs(bx) <= 22) return [255, 255, 255, 255];
    return [13, 148, 136, 255];
  }

  return [r, g, b, 255];
});

fs.writeFileSync(path.join(PUBLIC_DIR, 'og-image.png'), ogPng);

console.log('✅ All icons and preview images generated successfully!');
