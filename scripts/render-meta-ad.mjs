import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const frameDir = "/tmp/aplikasid-meta-ad-frames";
const outputDir = path.join(root, "output");
const fps = 30;
const duration = 15;
const width = 1080;
const height = 1920;
await fs.rm(frameDir, { recursive: true, force: true });
await fs.mkdir(frameDir, { recursive: true });
await fs.mkdir(outputDir, { recursive: true });

const asset = async (filename) => `data:image/png;base64,${(await sharp(await fs.readFile(path.join(root, filename))).png().toBuffer()).toString("base64")}`;
const [brand, office, photoshop, autocad, idm] = await Promise.all([
  asset("assets/logos/aplikasid.png"),
  asset("assets/logos/microsoft-office.png"),
  asset("assets/logos/photoshop.png"),
  asset("assets/logos/autocad.png"),
  asset("assets/logos/idm.png")
]);

const esc = (s) => String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const easeOut = (n) => 1 - Math.pow(1 - Math.max(0, Math.min(1, n)), 3);
const svgText = (text, x, y, size, fill = "#10233f", weight = 700, extra = "") =>
  `<text x="${x}" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}" ${extra}>${esc(text)}</text>`;
const img = (src, x, y, w, h, extra = "") => `<image href="${src}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet" ${extra}/>`;
const card = (x, y, w, h, content, r = 32) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="#fff" stroke="#e2e9f2" stroke-width="2"/><g>${content}</g>`;

function sceneAt(t, scene) {
  const local = t - scene * 3.75;
  const appear = easeOut(local / 0.5);
  const shift = (1 - appear) * 54;
  const head = (text, y, size = 92) => svgText(text, 82, y + shift, size, "#10233f", 750);
  const sub = (text, y, size = 34) => svgText(text, 84, y + shift, size, "#58677d", 500);
  let body = "";
  if (scene === 0) {
    body += `<g opacity="${appear}">`;
    body += svgText("KERJA · DESAIN · BISNIS", 84, 295, 24, "#2367e8", 700, 'letter-spacing="4"');
    body += head("Banyak tugas.", 510, 86);
    body += head("Mulai dari", 625, 86);
    body += svgText("software yang pas.", 84, 740 + shift, 82, "#2367e8", 750);
    body += sub("Temukan tools untuk bantu kerja lebih lancar.", 820, 30);
    body += card(84, 1000, 912, 440, `
      <rect x="85" y="1001" width="910" height="438" rx="32" fill="#f8faff"/>
      <circle cx="305" cy="1217" r="138" fill="#fff" stroke="#e8eef6" stroke-width="2"/>
      ${img(office, 205, 1117, 200, 200)}
      <circle cx="775" cy="1217" r="138" fill="#fff" stroke="#e8eef6" stroke-width="2"/>
      ${img(photoshop, 675, 1117, 200, 200)}
      ${svgText("Office", 305, 1370, 28, "#44536a", 650, 'text-anchor="middle"')}
      ${svgText("Photoshop", 775, 1370, 28, "#44536a", 650, 'text-anchor="middle"')}
      <path d="M500 1217h80m-22-22 22 22-22 22" fill="none" stroke="#91a5bf" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    `);
    body += svgText("Pilih software sesuai kebutuhanmu", 540, 1540, 26, "#728198", 600, 'text-anchor="middle"');
    body += `</g>`;
  }
  if (scene === 1) {
    body += `<g opacity="${appear}">`;
    body += svgText("PILIHAN UNTUK BERBAGAI KEBUTUHAN", 84, 285, 22, "#2367e8", 700, 'letter-spacing="3"');
    body += head("Satu tempat.", 480, 88);
    body += head("Banyak kebutuhan.", 590, 76);
    body += sub("Mulai dari tugas kuliah sampai proyek kreatif.", 675, 29);
    const items = [
      { x: 84, y: 820, title: "Microsoft Office", label: "OFFICE", logo: office, color: "#fff5ec" },
      { x: 548, y: 820, title: "Adobe Photoshop", label: "DESAIN", logo: photoshop, color: "#eef7ff" },
      { x: 84, y: 1200, title: "AutoCAD", label: "ENGINEERING", logo: autocad, color: "#fff0f3" },
      { x: 548, y: 1200, title: "IDM", label: "UTILITY", logo: idm, color: "#eef8f1" }
    ];
    for (const [i, item] of items.entries()) {
      const yy = item.y + shift + (1 - appear) * (i % 2 ? 38 : 18);
      body += card(item.x, yy, 448, 320, `
        <rect x="${item.x + 1}" y="${yy + 1}" width="446" height="318" rx="31" fill="${item.color}" stroke="none"/>
        <rect x="${item.x + 32}" y="${yy + 34}" width="118" height="118" rx="28" fill="#fff"/>
        ${img(item.logo, item.x + 45, yy + 47, 92, 92)}
        ${svgText(item.label, item.x + 32, yy + 207, 20, "#708098", 700, 'letter-spacing="2"')}
        ${svgText(item.title, item.x + 32, yy + 258, item.title.length > 13 ? 28 : 32, "#10233f", 700)}
      `);
    }
    body += `</g>`;
  }
  if (scene === 2) {
    body += `<g opacity="${appear}">`;
    body += svgText("BELANJA LEBIH TERARAH", 84, 300, 24, "#2367e8", 700, 'letter-spacing="4"');
    body += head("Cari yang", 510, 88);
    body += head("kamu butuhkan.", 620, 78);
    body += sub("Lihat katalog, pilih produk, lalu ikuti panduannya.", 700, 29);
    body += card(84, 850, 912, 600, `
      <rect x="84" y="850" width="912" height="102" rx="32" fill="#f7f9fc" stroke="none"/>
      <circle cx="140" cy="901" r="18" fill="none" stroke="#8392a7" stroke-width="4"/><path d="m153 914 15 15" stroke="#8392a7" stroke-width="4" stroke-linecap="round"/>
      ${svgText("Cari software...", 195, 911, 30, "#8795a8", 500)}
      <line x1="120" y1="1000" x2="960" y2="1000" stroke="#e6ecf4" stroke-width="2"/>
      ${img(office, 130, 1035, 100, 100)}
      ${svgText("Microsoft Office", 270, 1084, 31, "#142744", 700)}
      ${svgText("Office · Windows & Mac", 270, 1128, 23, "#76859b", 500)}
      <rect x="770" y="1053" width="170" height="54" rx="27" fill="#eaf1ff"/>
      ${svgText("Lihat produk  →", 855, 1089, 20, "#2367e8", 700, 'text-anchor="middle"')}
      <line x1="120" y1="1180" x2="960" y2="1180" stroke="#e6ecf4" stroke-width="2"/>
      <circle cx="151" cy="1260" r="25" fill="#e8f7ee"/><path d="m140 1260 8 8 15-18" fill="none" stroke="#198754" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      ${svgText("Panduan instalasi tersedia", 205, 1270, 27, "#35445b", 650)}
      <circle cx="151" cy="1360" r="25" fill="#e8f0ff"/><path d="M141 1351c0-8 20-8 20 0 0 9-16 8-16 18m6 9v1" fill="none" stroke="#2367e8" stroke-width="4" stroke-linecap="round"/>
      ${svgText("Bantuan pelanggan", 205, 1370, 27, "#35445b", 650)}
    `);
    body += svgText("Transaksi dan detail produk tersedia di website", 540, 1540, 25, "#728198", 550, 'text-anchor="middle"');
    body += `</g>`;
  }
  if (scene === 3) {
    body += `<g opacity="${appear}">`;
    body += svgText("MULAI DARI KEBUTUHANMU", 84, 350, 24, "#2367e8", 700, 'letter-spacing="4"');
    body += img(brand, 405, 510 + shift, 270, 270);
    body += svgText("Aplikasid", 540, 865 + shift, 68, "#10233f", 750, 'text-anchor="middle"');
    body += svgText("Software untuk kerja, desain, dan bisnis.", 540, 950 + shift, 27, "#66758a", 500, 'text-anchor="middle"');
    body += `<rect x="84" y="1080" width="912" height="150" rx="34" fill="#2367e8"/>`;
    body += svgText("Lihat katalog sekarang", 540, 1174, 38, "#ffffff", 700, 'text-anchor="middle"');
    body += `<circle cx="880" cy="1155" r="30" fill="#ffffff26"/><path d="M866 1155h27m-10-10 10 10-10 10" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
    body += svgText("Buka aplikasid.com", 540, 1320, 34, "#10233f", 700, 'text-anchor="middle"');
    body += svgText("Pilih software yang pas untuk langkah berikutnya.", 540, 1380, 23, "#728198", 500, 'text-anchor="middle"');
    body += `</g>`;
  }
  const brandHeader = `<g>${img(brand, 76, 76, 54, 54)}${svgText("aplikasid", 146, 115, 30, "#10233f", 750)}<line x1="84" y1="168" x2="996" y2="168" stroke="#e7edf5" stroke-width="2"/></g>`;
  const sceneNum = scene + 1;
  const progress = Math.max(0, Math.min(1, (local + 0.15) / 3.75));
  const footer = `<g><rect x="84" y="1780" width="912" height="5" rx="3" fill="#dfe6ef"/><rect x="84" y="1780" width="${912 * ((scene + progress) / 4)}" height="5" rx="3" fill="#2367e8"/>${svgText("APLIKASID.COM", 84, 1840, 20, "#77869a", 700, 'letter-spacing="2"')}${svgText(`0${sceneNum} / 04`, 996, 1840, 20, "#77869a", 700, 'text-anchor="end"')}</g>`;
  const bg = `<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ffffff"/><stop offset="1" stop-color="#f2f6fc"/></linearGradient><radialGradient id="glow"><stop stop-color="#dceaff" stop-opacity=".78"/><stop offset="1" stop-color="#dceaff" stop-opacity="0"/></radialGradient></defs><rect width="1080" height="1920" fill="url(#bg)"/><ellipse cx="890" cy="500" rx="400" ry="420" fill="url(#glow)"/><ellipse cx="170" cy="1420" rx="320" ry="360" fill="url(#glow)" opacity=".35"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${bg}${brandHeader}${body}${footer}</svg>`;
}

const total = fps * duration;
for (let frame = 0; frame < total; frame++) {
  const t = frame / fps;
  const scene = Math.min(3, Math.floor(t / 3.75));
  const svg = sceneAt(t, scene);
  await sharp(Buffer.from(svg)).png().toFile(path.join(frameDir, `frame-${String(frame).padStart(4, "0")}.png`));
}
console.log(`Rendered ${total} frames to ${frameDir}`);
