// Interactive Brushed Titanium Business Card Canvas Renderer
// Replicating the exact texture generation, dual-pass etching, and UV hit-mapping from pradiplabs.dev

export interface ContactTile {
  id: string;
  label: string;
  value: string;
  href: string;
  icon: 'mail' | 'phone' | 'whatsapp' | 'linkedin' | 'github' | 'globe';
  x: number;
  y: number;
  w: number;
  h: number;
}

export const CARD_WIDTH = 1024;
export const CARD_HEIGHT = 663;

// 6 Interactive contact tiles mapped in a 2-column by 3-row grid
export const CONTACT_TILES: ContactTile[] = [
  {
    id: 'email',
    label: 'Email',
    value: 'joshuadecedbit@gmail.com',
    href: 'mailto:joshuadecedbit@gmail.com',
    icon: 'mail',
    x: 64,
    y: 216,
    w: 420,
    h: 120
  },
  {
    id: 'phone',
    label: 'Phone',
    value: '+91 72599 87691',
    href: 'tel:+917259987691',
    icon: 'phone',
    x: 64,
    y: 350,
    w: 420,
    h: 120
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    value: 'Chat on WhatsApp',
    href: 'https://wa.me/917259987691',
    icon: 'whatsapp',
    x: 64,
    y: 484,
    w: 420,
    h: 120
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    value: 'in/Zynx',
    href: 'https://linkedin.com/in/Zynx',
    icon: 'linkedin',
    x: 540,
    y: 216,
    w: 420,
    h: 120
  },
  {
    id: 'github',
    label: 'GitHub',
    value: 'github.com/Zynxx777',
    href: 'https://github.com/Zynxx777',
    icon: 'github',
    x: 540,
    y: 350,
    w: 420,
    h: 120
  },
  {
    id: 'website',
    label: 'Website',
    value: 'zynx.is-a.dev',
    href: 'https://zynx.is-a.dev',
    icon: 'globe',
    x: 540,
    y: 484,
    w: 420,
    h: 120
  }
];

// Map 3D UV coordinate hit to contact tile
export function getContactTileAtUV(u: number, v: number): ContactTile | null {
  // In Three.js BoxGeometry face index 5 (-Z back face), u is horizontal and v is vertical (0 at bottom, 1 at top)
  const px = u * CARD_WIDTH;
  const py = (1 - v) * CARD_HEIGHT;

  for (const tile of CONTACT_TILES) {
    if (px >= tile.x && px <= tile.x + tile.w && py >= tile.y && py <= tile.y + tile.h) {
      return tile;
    }
  }
  return null;
}

// Dual-pass laser-etched metallic typography
function drawEtchedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  primaryColor: string = '#E3E3E8',
  maxWidth?: number
) {
  // 1. Dark upper groove cut shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillText(text, x, y - 1.2, maxWidth);

  // 2. Translucent lower edge specular glint
  ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
  ctx.fillText(text, x, y + 1.2, maxWidth);

  // 3. Primary surface typography
  ctx.fillStyle = primaryColor;
  ctx.fillText(text, x, y, maxWidth);
}

// Brushed titanium plate background with micro-grain & specular glint band
function drawBrushedTitaniumBase(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Base dark titanium gradient
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, '#353538');
  grad.addColorStop(1, '#1B1B1E');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Pseudo-random deterministic brushed metal lines
  let seed = 42;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };

  // Fine horizontal micro-brushed lines
  for (let y = 0; y < h; y += 1) {
    const alpha = (rnd() * 0.035).toFixed(3);
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fillRect(0, y, w, 1);
  }

  // Metallic micro-scratches
  for (let i = 0; i < 300; i++) {
    ctx.fillStyle = rnd() > 0.5 ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.14)';
    ctx.fillRect(rnd() * w, rnd() * h, 40 + rnd() * 240, 1);
  }

  // Diagonal anisotropic specular glint sheen band
  const sheen = ctx.createLinearGradient(0, 0, w, h);
  sheen.addColorStop(0, 'rgba(255, 255, 255, 0)');
  sheen.addColorStop(0.42, 'rgba(255, 255, 255, 0.04)');
  sheen.addColorStop(0.5, 'rgba(255, 255, 255, 0.10)');
  sheen.addColorStop(0.58, 'rgba(255, 255, 255, 0.04)');
  sheen.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, w, h);

  // Outer bevel border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, w - 2, h - 2);
}

// Draw circular avatar with metallic bezel
function drawAvatar(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | null,
  cx: number,
  cy: number,
  radius: number
) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.clip();

  if (img && img.complete && img.naturalWidth > 0) {
    const size = radius * 2.1;
    ctx.drawImage(img, cx - size / 2, cy - size / 2, size, size);
  } else {
    // Stylized ZYNX Monogram fallback
    const grad = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
    grad.addColorStop(0, '#00f0ff');
    grad.addColorStop(1, '#3b82f6');
    ctx.fillStyle = grad;
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${radius * 0.9}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Z', cx, cy);
  }

  ctx.restore();

  // Polished chrome bezel
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, radius + 3, 0, Math.PI * 2);
  ctx.stroke();
}

// Draw crisp vector icons directly to canvas
function drawIcon(ctx: CanvasRenderingContext2D, icon: ContactTile['icon'], x: number, y: number, size: number) {
  ctx.save();
  ctx.translate(x, y);
  const s = size / 24;
  ctx.scale(s, s);
  ctx.strokeStyle = '#C7C7CC';
  ctx.fillStyle = '#C7C7CC';
  ctx.lineWidth = 1.8;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (icon === 'mail') {
    ctx.beginPath();
    ctx.roundRect(2, 4, 20, 16, 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(2, 6);
    ctx.lineTo(12, 13);
    ctx.lineTo(22, 6);
    ctx.stroke();
  } else if (icon === 'phone') {
    ctx.beginPath();
    // Handset path
    ctx.moveTo(22, 16.92);
    ctx.lineTo(22, 19.92);
    ctx.arcTo(22, 22, 19.82, 22, 2);
    ctx.arcTo(11.19, 18.93, 2, 9.74, 18);
    ctx.arcTo(2, 4.11, 4.11, 2, 2);
    ctx.lineTo(7.11, 2);
    ctx.stroke();
    // Compact handset stroke
    ctx.beginPath();
    ctx.arc(12, 12, 7, -0.6, 1.2);
    ctx.stroke();
  } else if (icon === 'whatsapp') {
    ctx.beginPath();
    ctx.arc(12, 12, 9, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(12, 12, 5, 0.4, 2.8);
    ctx.stroke();
  } else if (icon === 'linkedin') {
    ctx.beginPath();
    ctx.roundRect(2.5, 2.5, 19, 19, 4);
    ctx.stroke();
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('in', 12, 13);
  } else if (icon === 'github') {
    ctx.beginPath();
    ctx.arc(12, 12, 9, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(9, 10, 1.5, 0, Math.PI * 2);
    ctx.arc(15, 10, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(12, 14, 4, 0.2, Math.PI - 0.2);
    ctx.stroke();
  } else if (icon === 'globe') {
    ctx.beginPath();
    ctx.arc(12, 12, 9, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(12, 12, 4.5, 9, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(3, 12);
    ctx.lineTo(21, 12);
    ctx.stroke();
  }

  ctx.restore();
}

// ─────────────────────────────────────────────────────────────────────────────
// FRONT CANVAS RENDERER
// ─────────────────────────────────────────────────────────────────────────────
export function drawCardFront(
  ctx: CanvasRenderingContext2D,
  avatarImg: HTMLImageElement | null
) {
  const w = CARD_WIDTH;
  const h = CARD_HEIGHT;

  drawBrushedTitaniumBase(ctx, w, h);

  // Top Left: Avatar
  drawAvatar(ctx, avatarImg, 118, 130, 52);

  // Top Right: "Open to work" badge
  ctx.save();
  ctx.font = '500 24px Inter, system-ui, sans-serif';
  ctx.textAlign = 'right';
  drawEtchedText(ctx, 'Open to work', w - 64, 140, '#E3E3E8');

  const textWidth = ctx.measureText('Open to work').width;
  ctx.fillStyle = '#30D158';
  ctx.beginPath();
  ctx.arc(w - 64 - textWidth - 18, 132, 6.5, 0, Math.PI * 2);
  ctx.fill();

  // Subtle pulsing glow around status dot
  ctx.strokeStyle = 'rgba(48, 209, 88, 0.4)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(w - 64 - textWidth - 18, 132, 10, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Bottom Left: Large Name
  ctx.save();
  ctx.textAlign = 'left';
  ctx.font = '600 62px Inter, system-ui, sans-serif';
  drawEtchedText(ctx, 'Joshua D', 64, h - 118, '#FFFFFF');

  // Subtitle
  ctx.font = '400 26px Inter, system-ui, sans-serif';
  drawEtchedText(ctx, 'Electronics & Communication Engineer · Linux Systems', 66, h - 70, '#8E8E93');

  // Bottom Right: Handle / Domain
  ctx.font = '500 22px Inter, system-ui, sans-serif';
  ctx.textAlign = 'right';
  drawEtchedText(ctx, 'zynx.is-a.dev', w - 64, h - 70, '#8E8E93');
  ctx.restore();
}

// ─────────────────────────────────────────────────────────────────────────────
// BACK CANVAS RENDERER
// ─────────────────────────────────────────────────────────────────────────────
export function drawCardBack(
  ctx: CanvasRenderingContext2D,
  avatarImg: HTMLImageElement | null
) {
  const w = CARD_WIDTH;
  const h = CARD_HEIGHT;

  drawBrushedTitaniumBase(ctx, w, h);

  // Mini Avatar in Header
  drawAvatar(ctx, avatarImg, 92, 114, 30);

  // Header Title
  ctx.save();
  ctx.textAlign = 'left';
  ctx.font = '600 36px Inter, system-ui, sans-serif';
  drawEtchedText(ctx, 'Joshua D', 142, 110, '#FFFFFF');

  // Header Subtitle
  ctx.font = '400 22px Inter, system-ui, sans-serif';
  drawEtchedText(ctx, 'Hardware Architect · Linux Systems Craftsman', 143, 142, '#8E8E93');

  // Header Right Hint
  ctx.textAlign = 'right';
  ctx.font = '500 21px Inter, system-ui, sans-serif';
  drawEtchedText(ctx, 'Tap a line to reach me', w - 64, 110, '#8E8E93');

  // Divider Line
  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.fillRect(64, 185, w - 128, 1.5);
  ctx.restore();

  // Draw 6 Contact Tiles
  for (const tile of CONTACT_TILES) {
    ctx.save();
    // Tile background container with soft rounded corners
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(tile.x, tile.y, tile.w, tile.h, 12);
    ctx.fill();
    ctx.stroke();

    // Tile Icon
    drawIcon(ctx, tile.icon, tile.x + 20, tile.y + 36, 36);

    // Tile Label
    ctx.textAlign = 'left';
    ctx.font = '500 20px Inter, system-ui, sans-serif';
    drawEtchedText(ctx, tile.label, tile.x + 72, tile.y + 44, '#8E8E93');

    // Tile Value
    ctx.font = '600 24px Inter, system-ui, sans-serif';
    drawEtchedText(ctx, tile.value, tile.x + 72, tile.y + 84, '#E3E3E8', tile.w - 85);

    ctx.restore();
  }
}

// Generate & Download vCard for Joshua D
export function downloadVCard() {
  const vcard = `BEGIN:VCARD
VERSION:3.0
N:D;Joshua;;;
FN:Joshua D (ZYNX)
ORG:ZYNX Labs
TITLE:Electronics & Communication Engineer | Linux Systems & Web Developer
EMAIL;type=INTERNET;type=WORK;type=pref:joshuadecedbit@gmail.com
TEL;type=CELL;type=VOICE;type=pref:+917259987691
URL;type=WORK:https://zynx.is-a.dev
URL;type=GitHub:https://github.com/Zynxx777
URL;type=LinkedIn:https://linkedin.com/in/Zynx
ADR;type=WORK:;;Channapatna;Karnataka;;India
NOTE:Electronics & Communication Engineering (DBIT 2025). Arch Linux, Hardware, Three.js WebGL.
END:VCARD`;

  const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'Joshua_D_ZYNX.vcf');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
