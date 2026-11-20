// Render frames for the 52s awareness reel "Versi terbaru belum tentu cocok" (9:16).
// Scene and caption timings follow output/Vo/vo pengetahuan umum 1.mp3.
// Usage: node scripts/render-cek-versi-reels.mjs <frame-dir>
import os from "node:os";
import path from "node:path";
import { NAVY, BLUE, YELLOW, GREY, width, height, clamp, ease, easeInOut, lerp, text, img, rect, check, appear, pop, shadowDefs, loadImage, captionAt, wipeAt, renderFrames } from "./reels-common.mjs";

const frameDir = process.argv[2] || path.join(os.tmpdir(), "aplikasid-cek-versi-frames");
const duration = 52;
const RED = "#e5484d";
const GREEN = "#1faa59";
const [brand, brandWhite] = await Promise.all([
  loadImage("assets/logos/aplikasid.png", 100),
  loadImage("assets/logos/aplikasid-hitamputih.png", 200)
]);

// Scene starts in seconds; boundaries sit in the narration pauses.
const scenes = [0, 4.8, 7.8, 15.6, 25.4, 35.98, 44.77, duration];
const captions = [
  [0.12, ["Versi software paling baru,", "belum tentu paling cocok untuk laptopmu."]],
  [5.06, ["Sebelum install, cek tiga hal ini."]],
  [8.08, ["Pertama, sistem operasi."]],
  [10.6, ["Installer untuk Windows tidak bisa", "dipasang di Mac, begitu juga sebaliknya."]],
  [15.78, ["Kedua, 64-bit atau 32-bit."]],
  [21.16, ["Banyak software modern sekarang", "hanya berjalan di sistem 64-bit."]],
  [25.64, ["Ketiga, RAM dan penyimpanan."]],
  [28.08, ["Versi yang lebih baru biasanya", "butuh spesifikasi lebih tinggi."]],
  [31.88, ["Sisakan juga ruang kosong yang", "cukup untuk proses instalasi."]],
  [36.16, ["Cara ceknya gampang."]],
  [37.72, ["Di Windows: Settings › System › About"]],
  [41.52, ["Di Mac: logo Apple › About This Mac"]],
  [44.96, ["Cocokkan dulu, baru install."]],
  [47.18, ["Simpan video ini biar", "nggak salah pilih versi."]],
  [49.9, null]
];
const checks = ["Sistem operasi", "64-bit atau 32-bit", "RAM & penyimpanan"];

const windowsIcon = (cx, cy, s, color = BLUE) => {
  const g = s * 0.08;
  const half = (s - g) / 2;
  return [0, 1].flatMap((r) => [0, 1].map((c) => rect(cx - s / 2 + c * (half + g), cy - s / 2 + r * (half + g), half, half, color, s * 0.05))).join("");
};
const laptopIcon = (cx, cy, s, color = NAVY) =>
  `<rect x="${cx - s * 0.4}" y="${cy - s * 0.38}" width="${s * 0.8}" height="${s * 0.52}" rx="${s * 0.06}" fill="none" stroke="${color}" stroke-width="${s * 0.07}"/><path d="M${cx - s * 0.52} ${cy + 0.26 * s}h${s * 1.04}" stroke="${color}" stroke-width="${s * 0.09}" stroke-linecap="round"/>`;
const crossBadge = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${RED}"/><path d="M${cx - r * 0.38} ${cy - r * 0.38}l${r * 0.76} ${r * 0.76}m0-${r * 0.76}-${r * 0.76} ${r * 0.76}" stroke="#ffffff" stroke-width="${r * 0.2}" stroke-linecap="round"/>`;

function stepHeader(t, at, n) {
  let g = appear(t, at, text(`CEK ${n} DARI 3`, 84, 290, 24, BLUE, 800, 'letter-spacing="4"'));
  g += pop(t, at + 0.1, 136, 392, `<circle cx="136" cy="392" r="52" fill="${BLUE}"/>${text(n, 136, 412, 56, "#ffffff", 800, 'text-anchor="middle"')}`);
  g += appear(t, at + 0.2, text(checks[n - 1], 216, 416, 66, NAVY, 800));
  return g;
}

function hookScene(t) {
  const bg = `<rect width="1080" height="1920" fill="#0d1b31"/><circle cx="980" cy="420" r="420" fill="#14284a"/><circle cx="60" cy="1500" r="380" fill="#132645"/>`;
  let body = "";
  body += appear(t, 0.05, text("SEBELUM INSTALL SOFTWARE", 84, 290, 24, YELLOW, 800, 'letter-spacing="4"'));
  body += appear(t, 0.1, text("Versi paling baru,", 84, 400, 70, "#ffffff", 800));
  body += appear(t, 2.86, text("belum tentu paling cocok.", 84, 490, 62, YELLOW, 800));
  const year = Math.round(lerp(2016, 2026, easeInOut((t - 0.2) / 2.1)));
  body += appear(t, 0.2, text("VERSI", 540, 600, 26, "#8fa3c2", 800, 'text-anchor="middle" letter-spacing="6"') + text(year, 540, 790, 200, "#ffffff", 800, 'text-anchor="middle"'));
  let laptop = rect(250, 870, 580, 360, "#1d3557", 26, 'stroke="#c9d6ea" stroke-width="8"');
  laptop += `<path d="M200 1240h680l-30 34h-620z" fill="#c9d6ea"/>`;
  const warn = ease((t - 2.86) / 0.35);
  const installing = text("Installing...", 540, 1020, 34, "#ffffff", 700, 'text-anchor="middle"') + rect(330, 1060, 420, 26, "#2c4a74", 13) + rect(330, 1060, 420 * 0.85 * ease((t - 0.6) / 2), 26, BLUE, 13);
  laptop += `<g opacity="${1 - warn}">${installing}</g>`;
  laptop += `<g opacity="${warn}"><path d="M540 935l70 122h-140z" fill="${YELLOW}" stroke="${YELLOW}" stroke-width="16" stroke-linejoin="round"/>${text("!", 540, 1045, 70, NAVY, 800, 'text-anchor="middle"')}${text("Cek dulu sebelum install", 540, 1140, 32, "#ffffff", 700, 'text-anchor="middle"')}</g>`;
  body += appear(t, 0.4, laptop, 60);
  return { bg, body, dark: true };
}

function introScene(t) {
  const bg = `<rect width="1080" height="1920" fill="#f6f8fc"/><circle cx="1030" cy="300" r="420" fill="#e6efff"/>`;
  let body = "";
  body += appear(t, 4.85, text("SEBELUM INSTALL", 84, 290, 24, BLUE, 800, 'letter-spacing="4"'));
  body += appear(t, 5.0, text("Cek 3 hal", 84, 410, 96, NAVY, 800));
  body += appear(t, 5.15, text("ini dulu.", 84, 515, 96, BLUE, 800));
  checks.forEach((label, i) => {
    const y = 620 + i * 180;
    let row = rect(84, y, 912, 150, "#ffffff", 30, 'filter="url(#shadow)"');
    row += `<circle cx="160" cy="${y + 75}" r="40" fill="#e9f0ff"/>${text(i + 1, 160, y + 91, 42, BLUE, 800, 'text-anchor="middle"')}`;
    row += text(label, 230, y + 89, 42, NAVY, 750);
    row += rect(882, y + 45, 60, 60, "#ffffff", 14, 'stroke="#c4d0e0" stroke-width="4"');
    body += appear(t, 5.6 + i * 0.3, row, 40);
  });
  return { bg, body };
}

function osScene(t) {
  const bg = `<rect width="1080" height="1920" fill="#ffffff"/><circle cx="60" cy="1300" r="380" fill="#eef4ff"/>`;
  let body = stepHeader(t, 7.9, 1);
  const cards = [
    { x: 84, name: "Windows", file: ".exe", icon: (cx) => windowsIcon(cx, 680, 110), rejectAt: 13.3, rejectEnd: 14.05 },
    { x: 556, name: "macOS", file: ".dmg", icon: (cx) => laptopIcon(cx, 690, 150), rejectAt: 14.6, rejectEnd: 15.6 }
  ];
  // The .exe chip tries the Mac card, the .dmg chip tries the Windows card.
  const rejected = (card) => t >= card.rejectAt && t < card.rejectEnd;
  cards.forEach((card, i) => {
    const cx = card.x + 220;
    const other = cards[1 - i];
    const shake = rejected(other) ? Math.sin((t - other.rejectAt) * 60) * 10 * (1 - clamp((t - other.rejectAt) / 0.5)) : 0;
    let g = rect(card.x, 560, 440, 400, "#ffffff", 34, `stroke="${rejected(other) ? RED : "#e1e8f1"}" stroke-width="${rejected(other) ? 5 : 2}" filter="url(#shadow)"`);
    g += card.icon(cx);
    g += text(card.name, cx, 830, 46, NAVY, 800, 'text-anchor="middle"');
    g += rect(cx - 110, 868, 220, 60, "#f1f5fb", 30) + text(`file ${card.file}`, cx, 908, 27, GREY, 700, 'text-anchor="middle"');
    if (rejected(other)) g += pop(t, other.rejectAt, card.x + 390, 610, crossBadge(card.x + 390, 610, 34), 0.3);
    body += appear(t, 9.2 + i * 0.25, `<g transform="translate(${shake} 0)">${g}</g>`, 50);
  });
  cards.forEach((card, i) => {
    const home = [card.x + 220, 1110];
    const target = [cards[1 - i].x + 220, 690];
    const moveStart = card.rejectAt - 0.5;
    let p = easeInOut((t - moveStart) / 0.5);
    if (i === 0) p *= 1 - easeInOut((t - card.rejectEnd) / 0.35);
    const x = lerp(home[0], target[0], p);
    const y = lerp(home[1], target[1], p);
    const chip = rect(x - 100, y - 38, 200, 76, "#ffffff", 22, `stroke="${NAVY}" stroke-width="3" filter="url(#shadow)"`) + `<path d="M${x - 70} ${y - 22}h24l12 12v32h-36z" fill="#e9f0ff" stroke="${BLUE}" stroke-width="3" stroke-linejoin="round"/>` + text(card.file, x + 18, y + 12, 34, NAVY, 800, 'text-anchor="middle"');
    body += appear(t, 10.7 + i * 0.2, chip, 30);
  });
  return { bg, body };
}

function bitScene(t) {
  const bg = `<rect width="1080" height="1920" fill="#eef4ff"/><circle cx="960" cy="1250" r="460" fill="#dfeaff"/>`;
  let body = stepHeader(t, 15.7, 2);
  const fade32 = 1 - 0.5 * ease((t - 22.8) / 0.6);
  let tile64 = rect(84, 560, 440, 540, "#ffffff", 34, `stroke="${BLUE}" stroke-width="${t > 21.2 ? 5 : 2}" filter="url(#shadow)"`) + text("64-bit", 304, 690, 92, BLUE, 800, 'text-anchor="middle"');
  tile64 += appear(t, 21.3, text("software modern", 304, 740, 28, GREY, 700, 'text-anchor="middle"'), 10);
  body += appear(t, 16.0, tile64, 50);
  let tile32 = rect(556, 560, 440, 540, "#ffffff", 34, 'stroke="#e1e8f1" stroke-width="2" filter="url(#shadow)"') + text("32-bit", 776, 690, 92, NAVY, 800, 'text-anchor="middle"');
  tile32 += appear(t, 22.9, text("makin jarang", 776, 860, 34, GREY, 700, 'text-anchor="middle"') + text("didukung", 776, 906, 34, GREY, 700, 'text-anchor="middle"'), 10);
  body += `<g opacity="${fade32}">${appear(t, 18.5, tile32, 50)}</g>`;
  const colors = ["#e86a3a", BLUE, "#16a36b", "#8b5cf6", "#e3a008", "#d6336c"];
  const glyphs = [
    (x, y) => `<circle cx="${x}" cy="${y}" r="22" fill="none" stroke="#fff" stroke-width="7"/>`,
    (x, y) => `<path d="M${x - 24} ${y + 20}l24-42 24 42z" fill="#fff"/>`,
    (x, y) => rect(x - 21, y - 21, 42, 42, "#fff", 6),
    (x, y) => `<path d="M${x - 22} ${y}h44M${x} ${y - 22}v44" stroke="#fff" stroke-width="9" stroke-linecap="round"/>`,
    (x, y) => `<path d="M${x - 24} ${y + 14}l16-28 16 18 16-22v32z" fill="#fff"/>`,
    (x, y) => `<circle cx="${x}" cy="${y}" r="9" fill="#fff"/><circle cx="${x}" cy="${y}" r="23" fill="none" stroke="#fff" stroke-width="5"/>`
  ];
  colors.forEach((color, i) => {
    const p = easeInOut((t - 21.4 - i * 0.18) / 0.55);
    if (t < 21.2) return;
    const tx = 174 + (i % 3) * 130;
    const ty = 840 + Math.floor(i / 3) * 130;
    const sx = 140 + i * 160;
    const x = lerp(sx, tx, p);
    const y = lerp(1260, ty, p);
    body += `<g opacity="${ease((t - 21.2 - i * 0.18) / 0.25)}">${rect(x - 52, y - 52, 104, 104, color, 26)}${glyphs[i](x, y)}</g>`;
  });
  return { bg, body };
}

function storageScene(t) {
  const bg = `<rect width="1080" height="1920" fill="#ffffff"/><circle cx="1000" cy="330" r="400" fill="#fff4cc"/>`;
  let body = stepHeader(t, 25.5, 3);
  let spec = rect(84, 560, 912, 400, "#ffffff", 34, 'stroke="#e1e8f1" stroke-width="2" filter="url(#shadow)"');
  spec += text("Kebutuhan spesifikasi", 124, 620, 30, GREY, 700);
  const oldH = 130 * ease((t - 28.3) / 0.6);
  const newH = 230 * ease((t - 28.9) / 0.8);
  spec += `<line x1="124" y1="880" x2="956" y2="880" stroke="#e1e8f1" stroke-width="3"/>`;
  spec += rect(220, 880 - oldH, 200, oldH, "#c4d0e0", 16) + rect(640, 880 - newH, 200, newH, BLUE, 16);
  spec += text("Versi lama", 320, 928, 28, GREY, 700, 'text-anchor="middle"') + text("Versi baru", 740, 928, 28, NAVY, 800, 'text-anchor="middle"');
  spec += appear(t, 29.6, text("lebih tinggi", 740, 880 - 230 - 18, 28, BLUE, 800, 'text-anchor="middle"'), 10);
  body += appear(t, 27.9, spec, 50);
  let disk = rect(84, 1000, 912, 330, "#ffffff", 34, 'stroke="#e1e8f1" stroke-width="2" filter="url(#shadow)"');
  disk += text("Penyimpanan", 124, 1066, 34, NAVY, 800);
  const barX = 124;
  const barW = 832;
  const used = barW * 0.48;
  const installer = barW * 0.2 * ease((t - 32.4) / 0.6);
  const free = ease((t - 33.3) / 0.5);
  disk += rect(barX, 1100, barW, 70, "#eef2f7", 20);
  disk += `<g opacity="${free}">${rect(barX + used + barW * 0.2 - 10, 1100, barW * 0.32 + 10, 70, GREEN, 20)}</g>`;
  disk += rect(barX + used - 20, 1100, installer + 20, 70, BLUE, 20);
  disk += rect(barX, 1100, used, 70, NAVY, 20);
  [["Terpakai", NAVY, 0], ["Installer", BLUE, 32.4], ["Sisa ruang", GREEN, 33.3]].forEach(([label, color, at], i) => {
    disk += `<g opacity="${at ? ease((t - at) / 0.3) : 1}"><circle cx="${144 + i * 280}" cy="1236" r="13" fill="${color}"/>${text(label, 168 + i * 280, 1246, 27, "#34435b", 700)}</g>`;
  });
  body += appear(t, 31.8, disk, 50);
  return { bg, body };
}

function howScene(t) {
  const bg = `<rect width="1080" height="1920" fill="#f6f8fc"/><circle cx="1030" cy="300" r="420" fill="#e6efff"/>`;
  let body = "";
  body += appear(t, 36.05, text("CARA CEK", 84, 290, 24, BLUE, 800, 'letter-spacing="4"'));
  body += appear(t, 36.15, text("Cara ceknya", 84, 405, 90, NAVY, 800));
  body += appear(t, 36.3, text("gampang.", 84, 500, 90, BLUE, 800));
  const panels = [
    { y: 580, at: 37.7, name: "Windows", icon: (y) => windowsIcon(150, y + 70, 56), steps: [["Settings", 38.5], ["System", 39.3], ["About", 40.3]], result: "Lihat tipe sistem (64-bit) & RAM", resultAt: 40.8 },
    { y: 950, at: 41.5, name: "Mac", icon: (y) => laptopIcon(150, y + 72, 70), steps: [["Logo Apple", 42.3], ["About This Mac", 43.3]], result: "Lihat chip, memori & versi macOS", resultAt: 43.9 }
  ];
  panels.forEach((panel) => {
    let g = rect(84, panel.y, 912, 330, "#ffffff", 34, 'filter="url(#shadow)"');
    g += panel.icon(panel.y);
    g += text(panel.name, 200, panel.y + 86, 42, NAVY, 800);
    let x = 124;
    panel.steps.forEach(([label, at], i) => {
      const w = label.length * 28 * 0.56 + 56;
      const last = i === panel.steps.length - 1;
      if (i > 0) {
        g += appear(t, at, text("›", x - 4, panel.y + 186, 46, "#9aa7b8", 700), 0);
        x += 34;
      }
      const chip = rect(x, panel.y + 136, w, 68, last ? BLUE : "#eef2f7", 34) + text(label, x + w / 2, panel.y + 181, 28, last ? "#ffffff" : NAVY, 750, 'text-anchor="middle"');
      g += pop(t, at, x + w / 2, panel.y + 170, chip, 0.35);
      x += w + 22;
    });
    g += appear(t, panel.resultAt, check(146, panel.y + 266, 22, "#e8f7ee", "#16834a") + text(panel.result, 186, panel.y + 276, 28, "#34435b", 650), 15);
    body += appear(t, panel.at, g, 50);
  });
  return { bg, body };
}

function closingScene(t) {
  const bg = `<rect width="1080" height="1920" fill="${NAVY}"/><circle cx="930" cy="160" r="470" fill="#1d3a68"/><circle cx="90" cy="1620" r="360" fill="#1a3155"/>`;
  let body = "";
  checks.forEach((label, i) => {
    const y = 330 + i * 92;
    body += appear(t, 44.95 + i * 0.3, check(120, y, 30, YELLOW, NAVY) + text(label, 172, y + 14, 40, "#ffffff", 700), 20);
  });
  body += appear(t, 44.96, text("Cocokkan dulu,", 84, 720, 86, "#ffffff", 800));
  body += appear(t, 45.9, text("baru install.", 84, 820, 86, YELLOW, 800));
  const save = rect(84, 920, 912, 160, YELLOW, 40) + `<path d="M148 958h52v84l-26-20-26 20z" fill="${NAVY}" stroke="${NAVY}" stroke-width="6" stroke-linejoin="round"/>` + text("Simpan video ini", 236, 996, 44, NAVY, 800) + text("biar nggak salah pilih versi", 236, 1044, 28, "#3b4b63", 650);
  body += pop(t, 47.2, 540, 1000, save, 0.45);
  body += appear(t, 49.9, img(brandWhite, 495, 1170, 90, 90) + text("Tips dari aplikasid", 540, 1320, 30, "#a9bbd3", 700, 'text-anchor="middle"'), 20);
  return { bg, body, dark: true, closing: true };
}

const sceneRenderers = [hookScene, introScene, osScene, bitScene, storageScene, howScene, closingScene];

function svgAt(t) {
  const index = scenes.findLastIndex((start) => t >= start);
  const scene = sceneRenderers[Math.min(index, sceneRenderers.length - 1)](t);
  const ink = scene.dark ? "#ffffff" : NAVY;
  const header = `<g>${rect(70, 72, 64, 64, "#ffffff", 16)}${img(brand, 76, 78, 52, 52)}${text("aplikasid", 150, 117, 32, ink, 800)}</g>`;
  const tipsTag = scene.closing ? "" : `<g>${rect(652, 76, 356, 58, "none", 29, `stroke="${ink}" stroke-opacity=".25" stroke-width="2"`)}${text("TIPS SEBELUM INSTALL", 830, 113, 19, ink, 800, 'text-anchor="middle" letter-spacing="2"')}</g>`;
  const progress = Math.round(1080 * (t / duration));
  const footer = `<rect x="0" y="1909" width="1080" height="11" fill="#9aa7b840"/><rect x="0" y="1909" width="${progress}" height="11" fill="${YELLOW}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${shadowDefs}${scene.bg}${scene.body}${captionAt(t, captions)}${wipeAt(t, scenes.slice(1, -1))}${header}${tipsTag}${footer}</svg>`;
}

await renderFrames(frameDir, duration, svgAt);
