import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const frameDir = "/tmp/aplikasid-meta-ad-frames";
const fps = 30;
const duration = 15;
const width = 1080;
const height = 1920;
const frameCount = fps * duration;
await fs.rm(frameDir, { recursive: true, force: true });
await fs.mkdir(frameDir, { recursive: true });

async function image(file) {
  const png = await sharp(await fs.readFile(path.join(root, file))).png().toBuffer();
  return `data:image/png;base64,${png.toString("base64")}`;
}
const [portrait, brand, office, photoshop, autocad, davinci, idm] = await Promise.all([
  image("output/aplikasid-deadline-opening-stock.jpg"),
  image("assets/logos/aplikasid.png"),
  image("assets/logos/microsoft-office.png"),
  image("assets/logos/photoshop.png"),
  image("assets/logos/autocad.png"),
  image("assets/logos/davinci.png"),
  image("assets/logos/idm.png")
]);
const esc = (s) => String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const clamp = (x) => Math.max(0, Math.min(1, x));
const ease = (x) => 1 - Math.pow(1 - clamp(x), 3);
function text(s, x, y, size, color = "#10233f", weight = 700, extra = "") {
  return `<text x="${x}" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="${size}" font-weight="${weight}" fill="${color}" ${extra}>${esc(s)}</text>`;
}
const img = (src, x, y, w, h) => `<image href="${src}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet"/>`;
const rect = (x, y, w, h, fill, radius = 28, extra = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${fill}" ${extra}/>`;
const scenes = [0, 2.4, 5.4, 8.4, 11.4, 15];

function svgAt(seconds) {
  const scene = Math.min(4, scenes.findIndex((start, i) => i < scenes.length - 1 && seconds >= start && seconds < scenes[i + 1]));
  const start = scenes[scene];
  const local = seconds - start;
  const intro = ease(local / 0.35);
  const rise = (1 - intro) * 46;
  let content = "";
  let bg = "<rect width='1080' height='1920' fill='#f8fafc'/>";

  if (scene === 0) {
    const zoom = 1.015 + 0.012 * (local / 2.4);
    bg = `<image href="${portrait}" x="0" y="0" width="1080" height="1920" preserveAspectRatio="xMidYMid slice" transform="translate(-8 -12) scale(${zoom})"/><defs><linearGradient id="shade" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#06101d" stop-opacity=".76"/><stop offset=".55" stop-color="#06101d" stop-opacity=".48"/><stop offset="1" stop-color="#06101d" stop-opacity=".04"/></linearGradient></defs><rect width="1080" height="1920" fill="url(#shade)"/>`;
    content += `<g opacity="${intro}">`;
    content += img(brand, 70, 78, 48, 48);
    content += text("aplikasid", 132, 113, 28, "#ffffff", 750);
    content += rect(70, 345 + rise, 246, 47, "#f6d44a", 23);
    content += text("MODE: DEADLINE", 193, 377 + rise, 17, "#17243b", 800, 'text-anchor="middle" letter-spacing="2"');
    content += text("DEADLINE", 70, 525 + rise, 91, "#ffffff", 800, 'letter-spacing="-2"');
    content += text("BESOK PAGI?", 70, 635 + rise, 88, "#ffe067", 800, 'letter-spacing="-3"');
    content += `<path d="M70 665h370" stroke="#ffe067" stroke-width="8" stroke-linecap="round"/>`;
    content += text("Software yang kamu butuh", 74, 740 + rise, 34, "#ffffff", 600);
    content += text("sudah siap?", 74, 787 + rise, 34, "#ffffff", 600);
    content += `<rect x="68" y="1705" width="7" height="7" rx="4" fill="#f6d44a"/>${text("Geser fokus. Bereskan deadline.", 94, 1712, 19, "#ffffff", 600)}`;
    content += `</g>`;
  }

  if (scene === 1) {
    bg = `<rect width="1080" height="1920" fill="#101b31"/><circle cx="1000" cy="400" r="430" fill="#172a49"/><circle cx="35" cy="1450" r="350" fill="#172a49"/>`;
    content += `<g opacity="${intro}">`;
    content += text("KAMU LAGI BUTUH APA?", 76, 225 + rise, 23, "#6ea3ff", 800, 'letter-spacing="3"');
    content += text("Cari tools", 76, 385 + rise, 78, "#ffffff", 800);
    content += text("buat jalan terus.", 76, 480 + rise, 69, "#ffffff", 800);
    content += text("Pilihan software untuk kebutuhanmu.", 78, 550 + rise, 26, "#b5c0d1", 500);
    const cards = [
      { x: 76, y: 690, name: "Office", label: "KERJA & KULIAH", logo: office, bg: "#fff5ec", c: "#10233f" },
      { x: 550, y: 690, name: "Desain", label: "KREATIF", logo: photoshop, bg: "#edf6ff", c: "#10233f" },
      { x: 76, y: 1115, name: "Engineering", label: "3D & GAMBAR", logo: autocad, bg: "#fff0f3", c: "#10233f" },
      { x: 550, y: 1115, name: "Editing", label: "VIDEO", logo: davinci, bg: "#edf9f5", c: "#10233f" }
    ];
    for (const [i, item] of cards.entries()) {
      const pop = ease((local - 0.12 - i * 0.12) / 0.32);
      const y = item.y + (1 - pop) * 72;
      content += `<g opacity="${pop}">${rect(item.x, y, 454, 360, item.bg, 34)}${rect(item.x + 27, y + 27, 116, 116, "#ffffff", 27)}${img(item.logo, item.x + 41, y + 41, 88, 88)}${text(item.label, item.x + 30, y + 226, 18, "#708096", 800, 'letter-spacing="2"')}${text(item.name, item.x + 30, y + 292, item.name.length > 10 ? 30 : 36, item.c, 800)}</g>`;
    }
    content += text("Office · Desain · Engineering · Editing", 540, 1635, 20, "#a6b4c9", 650, 'text-anchor="middle"');
    content += `</g>`;
  }

  if (scene === 2) {
    bg = `<rect width="1080" height="1920" fill="#f6f8fc"/><circle cx="1030" cy="280" r="430" fill="#e6efff"/>`;
    content += `<g opacity="${intro}">`;
    content += text("GAK PERLU MUTER-MUTER", 76, 240 + rise, 22, "#2367e8", 800, 'letter-spacing="3"');
    content += text("Cari. Pilih.", 76, 390 + rise, 82, "#10233f", 800);
    content += text("Lanjut kerjain.", 76, 486 + rise, 72, "#2367e8", 800);
    content += `<g filter="url(#shadow)">${rect(76, 640, 928, 740, "#ffffff", 32, 'stroke="#e4eaf2" stroke-width="2"')}`;
    content += rect(105, 675, 870, 90, "#f3f6fa", 22);
    content += `<circle cx="149" cy="720" r="14" fill="none" stroke="#8897aa" stroke-width="4"/><path d="m160 731 13 13" stroke="#8897aa" stroke-width="4" stroke-linecap="round"/>`;
    content += text("Cari software...", 196, 730, 27, "#7e8da2", 500);
    content += `<line x1="110" y1="800" x2="970" y2="800" stroke="#e7edf4" stroke-width="2"/>`;
    content += img(office, 122, 833, 102, 102);
    content += text("Microsoft Office", 256, 875, 29, "#172844", 750);
    content += text("Office · Windows & Mac", 256, 918, 21, "#75849a", 500);
    content += `<rect x="763" y="850" width="175" height="48" rx="24" fill="#e9f0ff"/>`;
    content += text("Lihat produk  →", 850, 881, 19, "#2367e8", 750, 'text-anchor="middle"');
    content += `<line x1="110" y1="972" x2="970" y2="972" stroke="#e7edf4" stroke-width="2"/>`;
    content += img(photoshop, 122, 1000, 102, 102);
    content += text("Adobe Photoshop", 256, 1042, 29, "#172844", 750);
    content += text("Desain · Windows & Mac", 256, 1085, 21, "#75849a", 500);
    content += `<line x1="110" y1="1140" x2="970" y2="1140" stroke="#e7edf4" stroke-width="2"/>`;
    content += `<circle cx="154" cy="1220" r="25" fill="#e8f7ee"/><path d="m143 1220 8 8 15-18" fill="none" stroke="#17864d" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
    content += text("Panduan instalasi tersedia", 206, 1230, 25, "#34435b", 650);
    content += `<circle cx="154" cy="1310" r="25" fill="#e9f0ff"/><path d="M154 1321v-1m-9-17c0-10 18-10 18 0 0 8-9 8-9 15" fill="none" stroke="#2367e8" stroke-width="4" stroke-linecap="round"/>`;
    content += text("Bantuan pelanggan", 206, 1320, 25, "#34435b", 650);
    content += `</g>`;
    content += text("Satu tempat untuk mulai cari.", 540, 1495, 25, "#67768b", 600, 'text-anchor="middle"');
    content += `</g>`;
  }

  if (scene === 3) {
    bg = `<rect width="1080" height="1920" fill="#eaf2ff"/><circle cx="850" cy="930" r="500" fill="#dbe8ff"/><circle cx="100" cy="1600" r="330" fill="#f8d96d" opacity=".25"/>`;
    content += `<g opacity="${intro}">`;
    content += text("BINGUNG PILIH YANG MANA?", 76, 285 + rise, 22, "#2367e8", 800, 'letter-spacing="3"');
    content += text("Tenang.", 76, 474 + rise, 98, "#10233f", 800);
    content += text("Ada panduan", 76, 584 + rise, 68, "#10233f", 800);
    content += text("dan bantuan pelanggan.", 76, 670 + rise, 52, "#2367e8", 800);
    content += rect(76, 850, 928, 182, "#ffffff", 30, 'stroke="#dce6f4" stroke-width="2"');
    content += `<circle cx="161" cy="941" r="43" fill="#e8f7ee"/><path d="m142 941 14 14 27-33" fill="none" stroke="#16834a" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`;
    content += text("Ada panduan instalasi", 235, 930, 29, "#172844", 750);
    content += text("untuk bantu langkahmu.", 235, 972, 23, "#68778c", 500);
    content += rect(76, 1070, 928, 182, "#ffffff", 30, 'stroke="#dce6f4" stroke-width="2"');
    content += `<circle cx="161" cy="1161" r="43" fill="#e9f0ff"/><path d="M151 1148c0-14 27-14 27 0 0 12-20 13-20 27m7 14v1" fill="none" stroke="#2367e8" stroke-width="6" stroke-linecap="round"/>`;
    content += text("Butuh bantuan?", 235, 1150, 29, "#172844", 750);
    content += text("Tim pelanggan siap membantu.", 235, 1192, 23, "#68778c", 500);
    content += `</g>`;
  }

  if (scene === 4) {
    bg = `<rect width="1080" height="1920" fill="#10233f"/><circle cx="915" cy="120" r="460" fill="#1d3a68"/><circle cx="100" cy="1610" r="350" fill="#1a3155"/>`;
    content += `<g opacity="${intro}">`;
    content += img(brand, 427, 300 + rise, 226, 226);
    content += text("aplikasid", 540, 615 + rise, 57, "#ffffff", 800, 'text-anchor="middle"');
    content += text("Deadline jalan terus.", 540, 835 + rise, 54, "#d7e4f7", 700, 'text-anchor="middle"');
    content += text("Cari softwaremu sekarang.", 540, 910 + rise, 43, "#ffffff", 800, 'text-anchor="middle"');
    content += rect(94, 1080, 892, 150, "#ffd84e", 36);
    content += text("CEK KATALOG SEKARANG", 500, 1174, 31, "#10233f", 800, 'text-anchor="middle" letter-spacing="1"');
    content += `<circle cx="917" cy="1155" r="30" fill="#10233f"/><path d="M903 1155h27m-10-10 10 10-10 10" fill="none" stroke="#ffd84e" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
    content += text("aplikasid.com", 540, 1340, 33, "#ffffff", 700, 'text-anchor="middle"');
    content += text("Kerja · Desain · Engineering · Editing", 540, 1395, 21, "#a9bbd3", 550, 'text-anchor="middle"');
    content += `</g>`;
  }

  const elapsed = seconds / duration;
  const progress = Math.round(1080 * elapsed);
  const destinationTag = `<g>${rect(606, 72, 402, 112, "#ffd84e", 30)}${text("KUNJUNGI", 642, 113, 15, "#10233f", 800, 'letter-spacing="2"')}${text("aplikasid.com", 642, 155, 31, "#10233f", 800)}</g>`;
  const footer = `<rect x="0" y="1909" width="1080" height="11" fill="#ffffff35"/><rect x="0" y="1909" width="${progress}" height="11" fill="#ffd84e"/>`;
  const definitions = `<defs><filter id="shadow" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#10233f" flood-opacity=".12"/></filter></defs>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${definitions}${bg}${content}${destinationTag}${footer}</svg>`;
}

for (let frame = 0; frame < frameCount; frame++) {
  const svg = svgAt(frame / fps);
  await sharp(Buffer.from(svg)).png().toFile(path.join(frameDir, `frame-${String(frame).padStart(4, "0")}.png`));
}
console.log(`Rendered ${frameCount} frames.`);
