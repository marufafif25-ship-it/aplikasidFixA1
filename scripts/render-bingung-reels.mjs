// Render frames for the 40s "Bingung mulai dari mana?" reel (9:16).
// Scene and caption timings follow the ElevenLabs narration in output/Vo/.
// Usage: node scripts/render-bingung-reels.mjs <frame-dir>
import os from "node:os";
import path from "node:path";
import { NAVY, BLUE, YELLOW, GREY, width, height, clamp, ease, easeInOut, back, lerp, text, img, rect, check, appear, pop, shadowDefs, loadImage, captionAt, wipeAt, renderFrames } from "./reels-common.mjs";

const frameDir = process.argv[2] || path.join(os.tmpdir(), "aplikasid-bingung-frames");
const duration = 40;
const [brand, brandWhite, office, photoshop, corel, autocad, sketchup, davinci] = await Promise.all([
  loadImage("assets/logos/aplikasid.png", 100),
  loadImage("assets/logos/aplikasid-hitamputih.png", 440),
  loadImage("assets/logos/microsoft-office.png"),
  loadImage("assets/logos/photoshop.png"),
  loadImage("assets/logos/coreldraw.png"),
  loadImage("assets/logos/autocad.png"),
  loadImage("assets/logos/sketchup.png"),
  loadImage("assets/logos/davinci.png")
]);

// [start, end] of each scene in seconds; boundaries sit in the narration pauses.
const scenes = [0, 3.5, 12.2, 19.4, 27.0, 32.45, duration];
// Narration segments detected from the audio, used for on-screen captions.
const captions = [
  [0.12, ["Mau install software,", "tapi bingung mulai dari mana?"]],
  [3.76, ["Di Aplikasid, semuanya sudah", "dirapikan sesuai kebutuhan."]],
  [7.78, ["Office, desain, engineering,", "editing video, sampai game."]],
  [12.34, ["Tinggal cari namanya, lalu cek versi", "dan platformnya, Windows atau Mac."]],
  [17.14, ["Detail paketnya jelas", "sebelum kamu beli."]],
  [19.56, ["Checkout-nya praktis."]],
  [21.12, ["Setelah itu, kamu dapat", "link unduhan Google Drive,"]],
  [23.85, ["lengkap dengan panduan instalasi", "langkah demi langkah."]],
  [27.18, ["Masih ragu?"]],
  [28.28, ["Tanya dulu lewat chat bantuan", "atau WhatsApp."]],
  [30.84, ["Tim kami siap bantu."]],
  [32.62, null]
];

function hookScene(t) {
  let bg = `<rect width="1080" height="1920" fill="#0d1b31"/><circle cx="980" cy="420" r="420" fill="#14284a"/><circle cx="60" cy="1500" r="380" fill="#132645"/>`;
  let body = "";
  body += appear(t, 0.05, text("MAU INSTALL SOFTWARE?", 76, 300, 26, YELLOW, 800, 'letter-spacing="4"'));
  body += appear(t, 0.15, text("Bingung", 76, 430, 116, "#ffffff", 800, 'letter-spacing="-2"'));
  body += appear(t, 0.3, text("mulai dari mana?", 76, 530, 80, YELLOW, 800, 'letter-spacing="-1"'));
  const windows = [
    { x: 70, y: 640, r: -5, label: "Versi yang mana?", at: 0.4 },
    { x: 540, y: 770, r: 4, label: "Windows atau Mac?", at: 0.75 },
    { x: 90, y: 990, r: 3, label: "Cara install-nya?", at: 1.1 },
    { x: 520, y: 1170, r: -4, label: "Download di mana?", at: 1.45 }
  ];
  const w = 470;
  const h = 200;
  windows.forEach((win, i) => {
    const wobble = Math.sin(t * 9 + i * 1.7) * 1.4;
    const cx = win.x + w / 2;
    const cy = win.y + h / 2;
    let card = rect(win.x, win.y, w, h, "#ffffff", 22, 'filter="url(#shadow)"');
    card += `<path d="M${win.x} ${win.y + 22}a22 22 0 0 1 22-22h${w - 44}a22 22 0 0 1 22 22v30h-${w}z" fill="#e8edf4"/>`;
    card += ["#ff6159", "#ffbd2e", "#28c941"].map((c, j) => `<circle cx="${win.x + 30 + j * 26}" cy="${win.y + 27}" r="8" fill="${c}"/>`).join("");
    card += `<circle cx="${win.x + 64}" cy="${win.y + 126}" r="32" fill="#fff1c2"/>${text("?", win.x + 64, win.y + 141, 42, "#b7791f", 800, 'text-anchor="middle"')}`;
    card += text(win.label, win.x + 116, win.y + 137, 31, NAVY, 750);
    body += pop(t, win.at, cx, cy, `<g transform="rotate(${win.r + wobble} ${cx} ${cy})">${card}</g>`, 0.45);
  });
  // A wandering cursor hovering between the open questions.
  if (t > 0.6) {
    const cx = 540 + Math.sin(t * 2.6) * 300;
    const cy = 1000 + Math.cos(t * 1.9) * 290;
    body += `<path d="M${cx} ${cy}l0 58 15-14 12 27 12-6-12-26 21-1z" fill="#ffffff" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/>`;
  }
  return { bg, body, dark: true };
}

function categoryScene(t) {
  const bg = `<rect width="1080" height="1920" fill="#f6f8fc"/><circle cx="1030" cy="300" r="420" fill="#e6efff"/>`;
  let body = "";
  body += appear(t, 3.6, text("SEMUA SUDAH DIRAPIKAN", 84, 290, 24, BLUE, 800, 'letter-spacing="4"'));
  body += appear(t, 3.75, text("Rapi sesuai", 84, 400, 86, NAVY, 800));
  body += appear(t, 3.9, text("kebutuhanmu.", 84, 495, 86, BLUE, 800));
  const cards = [
    { name: "Office", tag: "Kerja & kuliah", logos: [office], tint: "#fff5ec", x: 84, y: 600, w: 440, say: 7.85, from: [180, 260, -14] },
    { name: "Desain", tag: "Kreatif & grafis", logos: [photoshop, corel], tint: "#edf6ff", x: 556, y: 600, w: 440, say: 8.55, from: [-160, 420, 11] },
    { name: "Engineering", tag: "CAD & 3D", logos: [autocad, sketchup], tint: "#fff0f3", x: 84, y: 862, w: 440, say: 9.25, from: [260, -150, 9] },
    { name: "Video", tag: "Editing & animasi", logos: [davinci], tint: "#edf9f5", x: 556, y: 862, w: 440, say: 10.15, from: [-300, 120, -10] },
    { name: "Game", tag: "Hiburan", logos: [], tint: "#f4efff", x: 84, y: 1124, w: 912, say: 11.2, from: [60, -360, 6] }
  ];
  const h = 230;
  cards.forEach((card, i) => {
    const sort = easeInOut((t - 4.5 - i * 0.12) / 1.5);
    const [dx, dy, rot] = card.from;
    const x = card.x + dx * (1 - sort);
    const y = card.y + dy * (1 - sort);
    const said = clamp((t - card.say) / 0.25);
    const pulse = 1 + Math.sin(clamp((t - card.say) / 0.45) * Math.PI) * 0.045;
    const cx = x + card.w / 2;
    const cy = y + h / 2;
    let g = rect(x, y, card.w, h, said > 0 ? card.tint : "#ffffff", 32, `stroke="${said > 0 ? BLUE : "#e1e8f1"}" stroke-width="${said > 0 ? 4 : 2}" filter="url(#shadow)"`);
    card.logos.forEach((logo, j) => {
      g += rect(x + 28 + j * 128, y + 28, 112, 112, "#ffffff", 24, 'stroke="#edf1f6" stroke-width="2"') + img(logo, x + 40 + j * 128, y + 40, 88, 88);
    });
    if (!card.logos.length) {
      // Simple gamepad drawn in place of a product logo.
      g += rect(x + 28, y + 28, 112, 112, "#ffffff", 24, 'stroke="#edf1f6" stroke-width="2"');
      g += `<rect x="${x + 44}" y="${y + 62}" width="80" height="46" rx="23" fill="#6d4de0"/><path d="M${x + 66} ${y + 75}v20m-10-10h20" stroke="#fff" stroke-width="5" stroke-linecap="round"/><circle cx="${x + 100}" cy="${y + 80}" r="5" fill="#fff"/><circle cx="${x + 110}" cy="${y + 91}" r="5" fill="#fff"/>`;
    }
    g += text(card.name, x + 30, y + 196, 38, NAVY, 800);
    g += text(card.tag, x + card.w - 30, y + 196, 22, GREY, 600, 'text-anchor="end"');
    if (said > 0) g += `<g opacity="${said}">${check(x + card.w - 46, y + 46, 22, BLUE, "#ffffff")}</g>`;
    const enter = ease((t - 3.55 - i * 0.07) / 0.35);
    body += `<g opacity="${enter}" transform="translate(${cx} ${cy}) rotate(${rot * (1 - sort)}) scale(${lerp(0.86, 1, sort) * pulse}) translate(${-cx} ${-cy})">${g}</g>`;
  });
  return { bg, body };
}

function searchScene(t) {
  const bg = `<rect width="1080" height="1920" fill="#ffffff"/><circle cx="60" cy="380" r="380" fill="#eef4ff"/>`;
  let body = "";
  body += appear(t, 12.3, text("CARI · CEK · PILIH", 84, 290, 24, BLUE, 800, 'letter-spacing="4"'));
  body += appear(t, 12.4, text("Cek dulu,", 84, 400, 86, NAVY, 800));
  body += appear(t, 12.55, text("baru beli.", 84, 495, 86, BLUE, 800));
  let mock = rect(84, 590, 912, 800, "#ffffff", 34, 'stroke="#e1e8f1" stroke-width="2" filter="url(#shadow)"');
  mock += rect(112, 620, 856, 96, "#f3f6fa", 24);
  mock += `<circle cx="160" cy="664" r="15" fill="none" stroke="#8897aa" stroke-width="4"/><path d="m172 676 13 13" stroke="#8897aa" stroke-width="4" stroke-linecap="round"/>`;
  const query = "microsoft office";
  const typed = query.slice(0, Math.floor(clamp((t - 12.6) / 1.1) * query.length));
  mock += text(typed || "Cari software...", 206, 678, 31, typed ? NAVY : "#8b98aa", typed ? 650 : 500);
  if (t < 14 && Math.floor(t * 2.5) % 2 === 0) mock += `<rect x="${210 + typed.length * 17.4}" y="648" width="3" height="40" fill="${BLUE}"/>`;
  body += appear(t, 12.3, mock, 60);

  let result = `<line x1="112" y1="748" x2="968" y2="748" stroke="#e7edf4" stroke-width="2"/>`;
  result += rect(112, 774, 120, 120, "#ffffff", 26, 'stroke="#edf1f6" stroke-width="2"') + img(office, 124, 786, 96, 96);
  result += text("Microsoft Office", 258, 826, 38, NAVY, 800);
  result += text("Office & Produktivitas", 258, 872, 25, GREY, 550);
  body += appear(t, 13.8, result, 30);

  body += appear(t, 14.4, text("VERSI", 112, 950, 22, "#8a97a9", 800, 'letter-spacing="3"'), 20);
  const versions = ["2016", "2019", "2021", "2024", "365"];
  versions.forEach((v, i) => {
    const x = 112 + i * 168;
    const selected = v === "2024" && t > 15.2;
    const chip = rect(x, 970, 150, 64, selected ? BLUE : "#f1f5fb", 32, selected ? "" : 'stroke="#dbe4f0" stroke-width="2"') + text(v, x + 75, 1012, 27, selected ? "#ffffff" : NAVY, 750, 'text-anchor="middle"');
    body += pop(t, 14.5 + i * 0.08, x + 75, 1002, chip, 0.3);
  });

  body += appear(t, 15.5, text("PLATFORM", 112, 1090, 22, "#8a97a9", 800, 'letter-spacing="3"'), 20);
  ["Windows", "macOS"].forEach((v, i) => {
    const x = 112 + i * 250;
    const selected = i === 0 && t > 16.2;
    const chip = rect(x, 1110, 228, 64, selected ? BLUE : "#f1f5fb", 32, selected ? "" : 'stroke="#dbe4f0" stroke-width="2"') + text(v, x + 114, 1152, 27, selected ? "#ffffff" : NAVY, 750, 'text-anchor="middle"');
    body += pop(t, 15.65 + i * 0.25, x + 114, 1142, chip, 0.3);
  });

  ["Versi tersedia", "Platform yang didukung", "Catatan paket & persyaratan"].forEach((line, i) => {
    body += appear(t, 17.2 + i * 0.3, check(140, 1228 + i * 56, 20, "#e8f7ee", "#16834a") + text(line, 178, 1238 + i * 56, 27, "#34435b", 650), 20);
  });
  return { bg, body };
}

function deliveryScene(t) {
  const bg = `<rect width="1080" height="1920" fill="#eef4ff"/><circle cx="960" cy="1250" r="460" fill="#dfeaff"/>`;
  let body = "";
  body += appear(t, 19.5, text("SETELAH KAMU PILIH", 84, 290, 24, BLUE, 800, 'letter-spacing="4"'));
  body += appear(t, 19.6, text("Checkout praktis,", 84, 400, 80, NAVY, 800));
  body += appear(t, 19.75, text("panduan lengkap.", 84, 495, 80, BLUE, 800));
  const steps = [
    { y: 600, at: 19.6, title: "Checkout praktis", sub: "Lewat halaman checkout toko", icon: "cart" },
    { y: 860, at: 22.0, title: "Link Google Drive", sub: "Link unduhan untuk pesananmu", icon: "cloud" },
    { y: 1120, at: 24.0, title: "Panduan instalasi", sub: "Langkah demi langkah", icon: "guide" }
  ];
  const line = clamp((t - 20.6) / 3.6);
  body += `<line x1="160" y1="720" x2="160" y2="1240" stroke="#c9d8f2" stroke-width="6" stroke-dasharray="4 14" stroke-linecap="round"/>`;
  body += `<line x1="160" y1="720" x2="160" y2="${720 + 520 * line}" stroke="${BLUE}" stroke-width="6" stroke-linecap="round"/>`;
  steps.forEach((step, i) => {
    let g = rect(84, step.y, 912, 220, "#ffffff", 32, 'filter="url(#shadow)"');
    g += `<circle cx="160" cy="${step.y + 110}" r="50" fill="${i === 1 ? "#e8f7ee" : "#e9f0ff"}"/>`;
    const cy = step.y + 110;
    if (step.icon === "cart") g += `<path d="M136 ${cy - 18}h8l9 34h28l7-24h-40" fill="none" stroke="${BLUE}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="156" cy="${cy + 28}" r="5" fill="${BLUE}"/><circle cx="178" cy="${cy + 28}" r="5" fill="${BLUE}"/>`;
    if (step.icon === "cloud") g += `<path d="M138 ${cy + 12}a16 16 0 0 1 4-31 22 22 0 0 1 41 6 14 14 0 0 1-1 25" fill="none" stroke="#16834a" stroke-width="6" stroke-linecap="round"/><path d="M160 ${cy - 6}v34m-12-12 12 12 12-12" fill="none" stroke="#16834a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`;
    if (step.icon === "guide") g += `<rect x="138" y="${cy - 26}" width="44" height="54" rx="7" fill="none" stroke="${BLUE}" stroke-width="6"/><path d="M148 ${cy - 10}h24m-24 12h24m-24 12h14" stroke="${BLUE}" stroke-width="5" stroke-linecap="round"/>`;
    g += text(`0${i + 1}`, 250, step.y + 80, 22, "#8a97a9", 800, 'letter-spacing="3"');
    g += text(step.title, 250, step.y + 128, 40, NAVY, 800);
    g += text(step.sub, 250, step.y + 172, 26, GREY, 550);
    if (i === 0) {
      const tap = clamp((t - 20.2) / 0.6);
      g += rect(760, step.y + 78, 200, 64, tap > 0 ? "#1b55c4" : BLUE, 32) + text("Beli", 860, step.y + 120, 28, "#ffffff", 800, 'text-anchor="middle"');
      if (tap > 0 && tap < 1) g += `<circle cx="860" cy="${step.y + 110}" r="${20 + tap * 70}" fill="none" stroke="${BLUE}" stroke-width="4" opacity="${1 - tap}"/>`;
    }
    if (i === 2) {
      ["Unduh", "Ikuti", "Pakai"].forEach((label, j) => {
        const done = t > 24.9 + j * 0.55;
        g += `<g opacity="${clamp((t - 24.3 - j * 0.2) / 0.3)}">${done ? check(790 + j * 74, step.y + 110, 26, BLUE, "#ffffff") : `<circle cx="${790 + j * 74}" cy="${step.y + 110}" r="26" fill="#f1f5fb" stroke="#dbe4f0" stroke-width="2"/>`}</g>`;
      });
    }
    body += appear(t, step.at, g, 50);
  });
  return { bg, body };
}

function helpScene(t) {
  const bg = `<rect width="1080" height="1920" fill="#f6f8fc"/><circle cx="1000" cy="330" r="400" fill="#fff4cc"/>`;
  let body = "";
  body += appear(t, 27.15, text("Masih ragu?", 84, 400, 96, NAVY, 800));
  body += appear(t, 28.25, text("Tanya dulu aja.", 84, 495, 72, BLUE, 800));
  let chat = rect(84, 580, 912, 440, "#ffffff", 34, 'filter="url(#shadow)"');
  chat += `<path d="M84 614a34 34 0 0 1 34-34h844a34 34 0 0 1 34 34v66h-912z" fill="${NAVY}"/>`;
  chat += `<circle cx="140" cy="630" r="26" fill="#ffffff"/>${img(brand, 122, 612, 36, 36)}`;
  chat += text("Bantuan Aplikasid", 184, 642, 30, "#ffffff", 750);
  body += appear(t, 27.1, chat, 50);
  const ask = rect(420, 730, 540, 110, BLUE, 30) + text("Versi ini bisa untuk", 448, 776, 28, "#ffffff", 650) + text("laptop saya?", 448, 816, 28, "#ffffff", 650);
  body += appear(t, 28.35, ask, 30);
  if (t > 28.9 && t < 29.7) {
    body += rect(120, 870, 150, 80, "#eef2f7", 30) + [0, 1, 2].map((j) => `<circle cx="${160 + j * 35}" cy="910" r="9" fill="#8897aa" opacity="${0.35 + 0.65 * Math.abs(Math.sin(t * 7 - j * 0.8))}"/>`).join("");
  }
  const reply = rect(120, 870, 600, 110, "#eef2f7", 30) + text("Sebutkan OS laptopmu,", 148, 916, 28, NAVY, 650) + text("kami bantu cek dulu.", 148, 956, 28, NAVY, 650);
  body += appear(t, 29.7, reply, 30);
  const chatPill = rect(84, 1060, 440, 92, BLUE, 46) + `<path d="M150 1088h44a10 10 0 0 1 10 10v24a10 10 0 0 1-10 10h-24l-14 12v-12h-6a10 10 0 0 1-10-10v-24a10 10 0 0 1 10-10z" fill="#ffffff"/>` + text("Chat bantuan", 228, 1117, 31, "#ffffff", 800);
  const waPill = rect(556, 1060, 440, 92, "#1faa59", 46) + `<circle cx="640" cy="1106" r="24" fill="none" stroke="#ffffff" stroke-width="5"/><path d="M630 1096c2 9 7 15 18 19" stroke="#ffffff" stroke-width="5" stroke-linecap="round" fill="none"/>` + text("WhatsApp", 688, 1117, 31, "#ffffff", 800);
  body += pop(t, 29.25, 304, 1106, chatPill, 0.35);
  body += pop(t, 29.95, 776, 1106, waPill, 0.35);
  const team = rect(84, 1180, 912, 84, NAVY, 42) + `<path d="M150 1232v-12a26 26 0 0 1 52 0v12" fill="none" stroke="${YELLOW}" stroke-width="6" stroke-linecap="round"/><rect x="144" y="1222" width="14" height="22" rx="6" fill="${YELLOW}"/><rect x="194" y="1222" width="14" height="22" rx="6" fill="${YELLOW}"/>` + text("Tim kami siap bantu", 236, 1234, 32, "#ffffff", 800);
  body += appear(t, 30.85, team, 30);
  return { bg, body };
}

function ctaScene(t) {
  const bg = `<rect width="1080" height="1920" fill="${NAVY}"/><circle cx="930" cy="160" r="470" fill="#1d3a68"/><circle cx="90" cy="1620" r="360" fill="#1a3155"/>`;
  let body = "";
  body += pop(t, 32.6, 540, 450, img(brandWhite, 430, 340, 220, 220), 0.55);
  body += appear(t, 32.75, text("aplikasid", 540, 680, 76, "#ffffff", 800, 'text-anchor="middle"'));
  body += appear(t, 33.55, text("Software untuk kerja", 540, 800, 52, "#d7e4f7", 700, 'text-anchor="middle"'));
  body += appear(t, 33.75, text("sampai hiburan.", 540, 868, 52, YELLOW, 800, 'text-anchor="middle"'));
  const pulse = t > 36.6 ? 1 + Math.sin((t - 36.6) * 5) * 0.025 : 1;
  const button = `<g transform="translate(540 1110) scale(${pulse}) translate(-540 -1110)">${rect(94, 1035, 892, 150, YELLOW, 40)}${text("CEK KATALOG SEKARANG", 500, 1128, 34, NAVY, 800, 'text-anchor="middle" letter-spacing="1"')}<circle cx="912" cy="1110" r="32" fill="${NAVY}"/><path d="M897 1110h29m-11-11 11 11-11 11" fill="none" stroke="${YELLOW}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  body += pop(t, 36.1, 540, 1110, button, 0.45);
  body += appear(t, 36.6, text("aplikasid.com", 540, 1310, 62, "#ffffff", 800, 'text-anchor="middle"'));
  body += appear(t, 37.0, text("Office · Desain · Engineering · Video · Game", 540, 1380, 25, "#a9bbd3", 600, 'text-anchor="middle"'));
  return { bg, body, dark: true, cta: true };
}

const sceneRenderers = [hookScene, categoryScene, searchScene, deliveryScene, helpScene, ctaScene];

function svgAt(t) {
  const index = scenes.findLastIndex((start) => t >= start);
  const scene = sceneRenderers[Math.min(index, sceneRenderers.length - 1)](t);
  const headerColor = scene.dark ? "#ffffff" : NAVY;
  const header = `<g>${rect(70, 72, 64, 64, "#ffffff", 16)}${img(brand, 76, 78, 52, 52)}${text("aplikasid", 150, 117, 32, headerColor, 800)}</g>`;
  const destinationTag = scene.cta ? "" : `<g>${rect(606, 66, 402, 112, YELLOW, 30)}${text("KUNJUNGI", 642, 107, 15, NAVY, 800, 'letter-spacing="2"')}${text("aplikasid.com", 642, 149, 31, NAVY, 800)}</g>`;
  const progress = Math.round(1080 * (t / duration));
  const footer = `<rect x="0" y="1909" width="1080" height="11" fill="#9aa7b840"/><rect x="0" y="1909" width="${progress}" height="11" fill="${YELLOW}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${shadowDefs}${scene.bg}${scene.body}${captionAt(t, captions)}${wipeAt(t, scenes.slice(1, -1))}${header}${destinationTag}${footer}</svg>`;
}

await renderFrames(frameDir, duration, svgAt);
