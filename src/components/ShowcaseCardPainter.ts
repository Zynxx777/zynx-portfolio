import * as THREE from "three";
import type { ShowcaseProject } from "../data/showcaseProjects";

export interface DynamicCardPainter {
  texture: THREE.CanvasTexture;
  update: (elapsedSeconds: number, phaseOffset: number, hoverAmount: number, visible?: boolean) => void;
  dispose: () => void;
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
) {
  if (!img.complete || img.naturalWidth === 0) return;
  const scale = Math.max(dw / img.naturalWidth, dh / img.naturalHeight);
  const sw = dw / scale;
  const sh = dh / scale;
  const sx = (img.naturalWidth - sw) * 0.5;
  const sy = (img.naturalHeight - sh) * 0.5;
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}

function drawRoundedRectClip(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.clip();
}

function renderSlideHero(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  project: ShowcaseProject,
  primary: HTMLImageElement | null,
  secondary: HTMLImageElement | null,
) {
  ctx.fillStyle = project.slideTheme.bgSecondary;
  ctx.fillRect(0, 0, W, H);

  if (primary && primary.complete && primary.naturalWidth > 0) {
    drawCoverImage(ctx, primary, 0, 0, W, H);
  }

  // Subtle corner mosaic card in upper-right when secondary image exists
  if (secondary && secondary.complete && secondary.naturalWidth > 0) {
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.45)";
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 12;
    drawRoundedRectClip(ctx, W - 360, 44, 304, 192, 16);
    drawCoverImage(ctx, secondary, W - 360, 44, 304, 192);
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.22)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(W - 360, 44, 304, 192, 16);
    ctx.stroke();
    ctx.restore();
  }

  // Subtle top editorial caption badge matching reference cards
  ctx.fillStyle = "rgba(255,255,255,0.72)";
  ctx.font = "500 20px 'JetBrains Mono', monospace";
  ctx.fillText(project.slideTheme.chapterLabel, 54, 62);
}

function renderSlideEditorial(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  project: ShowcaseProject,
  primary: HTMLImageElement | null,
  secondary: HTMLImageElement | null,
) {
  const { bg, bgSecondary, accent, ink, nums, editorialQuote, highlights } = project.slideTheme;
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, bg);
  grad.addColorStop(1, bgSecondary);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Subtle radial accent wash like jesperlandberg's editorial project slides
  const glow = ctx.createRadialGradient(W * 0.72, H * 0.35, 20, W * 0.72, H * 0.35, 520);
  glow.addColorStop(0, `${accent}26`);
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Left stacked architectural chapter numerals (Book of Happiness style)
  ctx.save();
  ctx.fillStyle = accent;
  ctx.globalAlpha = 0.9;
  ctx.font = "700 84px 'Space Grotesk', Inter, sans-serif";
  nums.forEach((num, idx) => {
    ctx.fillText(num, 58, 128 + idx * 82);
  });
  ctx.restore();

  // Middle editorial headline + bullet points (Nathan Riley style)
  ctx.fillStyle = ink;
  ctx.font = "500 56px 'Space Grotesk', Inter, sans-serif";
  ctx.fillText(project.name, 224, 134, 540);

  ctx.fillStyle = `${ink}b8`;
  ctx.font = "400 24px Inter, sans-serif";
  ctx.fillText(editorialQuote, 224, 184, 540);

  ctx.font = "500 21px Inter, sans-serif";
  highlights.slice(0, 4).forEach((item, idx) => {
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(232, 250 + idx * 42, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `${ink}e6`;
    ctx.fillText(item, 250, 257 + idx * 42, 420);
  });

  // Right framed preview plate
  const plateImg = secondary && secondary.complete && secondary.naturalWidth > 0 ? secondary : primary;
  if (plateImg && plateImg.complete && plateImg.naturalWidth > 0) {
    ctx.save();
    ctx.translate(W - 255, H * 0.45);
    ctx.rotate(0.035);
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 32;
    drawRoundedRectClip(ctx, -195, -210, 390, 400, 20);
    drawCoverImage(ctx, plateImg, -195, -210, 390, 400);
    ctx.restore();

    ctx.save();
    ctx.translate(W - 255, H * 0.45);
    ctx.rotate(0.035);
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-195, -210, 390, 400, 20);
    ctx.stroke();
    ctx.restore();
  }
}

export function createShowcaseCardPainter(project: ShowcaseProject): DynamicCardPainter {
  const W = 1280;
  const H = 760;
  const OUT_W = 832;
  const OUT_H = 494;

  const canvas = document.createElement("canvas");
  canvas.width = OUT_W;
  canvas.height = OUT_H;
  const ctx = canvas.getContext("2d");

  const slideA = document.createElement("canvas");
  slideA.width = W;
  slideA.height = H;
  const ctxA = slideA.getContext("2d");

  const slideB = document.createElement("canvas");
  slideB.width = W;
  slideB.height = H;
  const ctxB = slideB.getContext("2d");

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;

  let primaryImg: HTMLImageElement | null = null;
  let secondaryImg: HTMLImageElement | null = null;
  let dirty = true;
  let lastBlend = -1;
  let lastHover = -1;
  let disposed = false;

  const stampCaptionScrim = (targetCtx: CanvasRenderingContext2D) => {
    const shade = targetCtx.createLinearGradient(0, H * 0.48, 0, H);
    shade.addColorStop(0, "rgba(0,0,0,0)");
    shade.addColorStop(0.5, "rgba(0,0,0,0.22)");
    shade.addColorStop(1, "rgba(0,0,0,0.82)");
    targetCtx.fillStyle = shade;
    targetCtx.fillRect(0, 0, W, H);

    targetCtx.fillStyle = "rgba(255,255,255,0.95)";
    targetCtx.font = "500 38px Inter, -apple-system, sans-serif";
    targetCtx.textBaseline = "middle";
    targetCtx.fillText(project.name, 52, H - 56, W - 180);
  };

  const bakeSlides = () => {
    if (ctxA) {
      renderSlideHero(ctxA, W, H, project, primaryImg, secondaryImg);
      stampCaptionScrim(ctxA);
    }
    if (ctxB) {
      renderSlideEditorial(ctxB, W, H, project, primaryImg, secondaryImg);
      stampCaptionScrim(ctxB);
    }
    dirty = true;
  };

  const loadImg = (src: string, onDone: (el: HTMLImageElement) => void) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (disposed) return;
      onDone(img);
      bakeSlides();
    };
    img.src = src;
  };

  loadImg(project.img, (el) => {
    primaryImg = el;
  });
  if (project.gallery[1] && project.gallery[1] !== project.img) {
    loadImg(project.gallery[1], (el) => {
      secondaryImg = el;
    });
  }

  // Initial synchronous bake so cards render crisply immediately
  bakeSlides();

  const scale = OUT_W / W;
  const bx = Math.round((W - 56) * scale);
  const by = Math.round((H - 56) * scale);

  const update = (elapsedSeconds: number, phaseOffset: number, hoverAmount: number, visible = true) => {
    if (!visible && !dirty) return;

    // Smooth periodic cycling every ~6.4s (hold A -> crossfade -> hold B -> crossfade)
    const cycle = ((elapsedSeconds + phaseOffset) % 6.4) / 6.4;
    let blend = 0;
    if (cycle < 0.36) {
      blend = 0;
    } else if (cycle < 0.5) {
      const t = (cycle - 0.36) / 0.14;
      blend = t * t * (3 - 2 * t);
    } else if (cycle < 0.86) {
      blend = 1;
    } else {
      const t = 1 - (cycle - 0.86) / 0.14;
      blend = t * t * (3 - 2 * t);
    }

    const quantizedHover = Math.round(hoverAmount * 12) / 12;
    if (!dirty && Math.abs(blend - lastBlend) < 0.032 && Math.abs(quantizedHover - lastHover) < 0.08) {
      return;
    }
    dirty = false;
    lastBlend = blend;
    lastHover = quantizedHover;

    if (!ctx) return;

    if (blend < 0.999) {
      ctx.globalAlpha = 1;
      ctx.drawImage(slideA, 0, 0, OUT_W, OUT_H);
    }
    if (blend > 0.001) {
      ctx.globalAlpha = blend;
      ctx.drawImage(slideB, 0, 0, OUT_W, OUT_H);
      ctx.globalAlpha = 1;
    }

    // Bottom-right circular preview/action button
    const radius = (24 + hoverAmount * 2) * scale;
    ctx.beginPath();
    ctx.arc(bx, by, radius, 0, Math.PI * 2);
    ctx.fillStyle = hoverAmount > 0.35 ? "rgba(255,255,255,0.95)" : "rgba(0,0,0,0.68)";
    ctx.fill();
    ctx.strokeStyle = hoverAmount > 0.35 ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.65)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const arrowScale = scale;
    ctx.strokeStyle = hoverAmount > 0.35 ? "#090a0d" : "rgba(255,255,255,0.92)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(bx - 7 * arrowScale, by);
    ctx.lineTo(bx + 7 * arrowScale, by);
    ctx.lineTo(bx + 2 * arrowScale, by - 5 * arrowScale);
    ctx.moveTo(bx + 7 * arrowScale, by);
    ctx.lineTo(bx + 2 * arrowScale, by + 5 * arrowScale);
    ctx.stroke();

    texture.needsUpdate = true;
  };

  const dispose = () => {
    disposed = true;
    texture.dispose();
  };

  return { texture, update, dispose };
}
