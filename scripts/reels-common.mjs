// Shared SVG helpers for the 9:16 reel renderers (render-*-reels.mjs).
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

export const width = 1080;
export const height = 1920;
export const fps = 30;
export const NAVY = "#10233f";
export const BLUE = "#2367e8";
export const YELLOW = "#ffd84e";
export const GREY = "#68778c";

export const esc = (s) => String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
export const clamp = (x) => Math.max(0, Math.min(1, x));
export const ease = (x) => 1 - Math.pow(1 - clamp(x), 3);
export const easeInOut = (x) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
export const back = (x) => { x = clamp(x); const c1 = 1.70158; return 1 + (c1 + 1) * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
export const lerp = (a, b, p) => a + (b - a) * p;
export function text(s, x, y, size, color = NAVY, weight = 700, extra = "") {
  return `<text x="${x}" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="${size}" font-weight="${weight}" fill="${color}" ${extra}>${esc(s)}</text>`;
}
export const img = (src, x, y, w, h) => `<image href="${src}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet"/>`;
export const rect = (x, y, w, h, fill, radius = 28, extra = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${fill}" ${extra}/>`;
export const check = (cx, cy, r, bg, color) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${bg}"/><path d="M${cx - r * 0.42} ${cy}l${r * 0.3} ${r * 0.3} ${r * 0.55}-${r * 0.62}" fill="none" stroke="${color}" stroke-width="${Math.max(3, r * 0.17)}" stroke-linecap="round" stroke-linejoin="round"/>`;
// Fade + rise for an element that appears at `at` seconds.
export const appear = (t, at, body, rise = 40, span = 0.35) => {
  const p = ease((t - at) / span);
  return p <= 0 ? "" : `<g opacity="${p}" transform="translate(0 ${(1 - p) * rise})">${body}</g>`;
};
// Scale-pop around a center point.
export const pop = (t, at, cx, cy, body, span = 0.4) => {
  const p = clamp((t - at) / span);
  if (p <= 0) return "";
  const s = lerp(0.6, 1, back(p));
  return `<g opacity="${ease(p * 1.6)}" transform="translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})">${body}</g>`;
};
export const shadowDefs = `<defs><filter id="shadow" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="${NAVY}" flood-opacity=".12"/></filter></defs>`;

export async function loadImage(file, size = 240) {
  const png = await sharp(await fs.readFile(path.join(process.cwd(), file))).resize(size, size, { fit: "inside" }).png().toBuffer();
  return `data:image/png;base64,${png.toString("base64")}`;
}

// captions: [[startSeconds, lines | null], ...] taken from the narration's speech segments.
export function captionAt(t, captions) {
  const index = captions.findLastIndex(([start]) => t >= start - 0.08);
  if (index < 0 || !captions[index][1]) return "";
  const [start, lines] = captions[index];
  const p = ease((t - start + 0.08) / 0.15);
  const size = 36;
  const longest = Math.max(...lines.map((line) => line.length));
  const w = Math.min(960, longest * size * 0.53 + 72);
  const h = lines.length * 50 + 34;
  const y = 1470;
  let body = rect(540 - w / 2, y, w, h, NAVY, 26, 'fill-opacity=".92"');
  lines.forEach((line, i) => { body += text(line, 540, y + 56 + i * 50, size, "#ffffff", 700, 'text-anchor="middle"'); });
  return `<g opacity="${p}">${body}</g>`;
}

// Slanted wipe that covers the cut at each scene boundary.
export function wipeAt(t, boundaries, color = YELLOW) {
  for (const boundary of boundaries) {
    const u = (t - (boundary - 0.3)) / 0.6;
    if (u > 0 && u < 1) {
      const x = -1400 + easeInOut(u) * 2800;
      return `<path d="M${x} 0h1300l-200 1920h-1300z" fill="${color}"/>`;
    }
  }
  return "";
}

// Writes frame-0000.png... into frameDir. FRAMES=12,90 renders only those frames (for previews).
export async function renderFrames(frameDir, duration, svgAt) {
  await fs.rm(frameDir, { recursive: true, force: true });
  await fs.mkdir(frameDir, { recursive: true });
  const only = process.env.FRAMES?.split(",").map(Number);
  const frames = only ?? Array.from({ length: fps * duration }, (_, frame) => frame);
  const batch = 6;
  for (let i = 0; i < frames.length; i += batch) {
    await Promise.all(frames.slice(i, i + batch).map((frame) =>
      sharp(Buffer.from(svgAt(frame / fps))).png().toFile(path.join(frameDir, `frame-${String(frame).padStart(4, "0")}.png`))
    ));
    if (i % 300 === 0) console.log(`Rendered ${i}/${frames.length} frames`);
  }
  console.log(`Rendered ${frames.length} frames to ${frameDir}`);
}
