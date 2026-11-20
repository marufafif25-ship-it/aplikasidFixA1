// Render the 9:16 cover image for the "Versi terbaru belum tentu cocok" reel.
// Key content stays inside the centre 3:4 area (y 240–1680) so the Instagram grid crop keeps it.
// Usage: node scripts/render-cek-versi-cover.mjs [output.png]
import sharp from "sharp";
import { NAVY, YELLOW, width, height, text, img, rect, check, loadImage } from "./reels-common.mjs";

const output = process.argv[2] || "output/aplikasid-cover-cek-versi.png";
const brand = await loadImage("assets/logos/aplikasid.png", 100);

let body = `<rect width="1080" height="1920" fill="#0d1b31"/><circle cx="980" cy="380" r="440" fill="#14284a"/><circle cx="60" cy="1560" r="420" fill="#132645"/>`;
body += `<g>${rect(70, 72, 64, 64, "#ffffff", 16)}${img(brand, 76, 78, 52, 52)}${text("aplikasid", 150, 117, 32, "#ffffff", 800)}</g>`;
body += rect(330, 300, 420, 64, "none", 32, 'stroke="#ffffff" stroke-opacity=".3" stroke-width="2"') + text("TIPS SEBELUM INSTALL", 540, 342, 22, "#ffffff", 800, 'text-anchor="middle" letter-spacing="3"');
body += text("JANGAN ASAL", 540, 520, 116, "#ffffff", 800, 'text-anchor="middle" letter-spacing="-2"');
body += text("INSTALL", 540, 690, 172, YELLOW, 800, 'text-anchor="middle" letter-spacing="-3"');
body += text("VERSI TERBARU", 540, 815, 100, "#ffffff", 800, 'text-anchor="middle" letter-spacing="-2"');

// Laptop with a warning sign.
body += rect(320, 900, 440, 270, "#1d3557", 22, 'stroke="#c9d6ea" stroke-width="7"');
body += `<path d="M275 1178h530l-24 28h-482z" fill="#c9d6ea"/>`;
body += `<path d="M540 950l64 112h-128z" fill="${YELLOW}" stroke="${YELLOW}" stroke-width="14" stroke-linejoin="round"/>${text("!", 540, 1050, 64, NAVY, 800, 'text-anchor="middle"')}`;
body += text("2026?", 540, 1125, 34, "#c9d6ea", 800, 'text-anchor="middle"');

body += rect(150, 1280, 780, 120, YELLOW, 60) + text("Cek 3 hal ini dulu", 540, 1360, 54, NAVY, 800, 'text-anchor="middle"');
const items = [["OS", 261], ["64-bit", 459], ["RAM", 712]];
items.forEach(([label, x]) => {
  body += check(x, 1500, 26, YELLOW, NAVY) + text(label, x + 42, 1514, 40, "#ffffff", 800);
});

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${body}</svg>`;
await sharp(Buffer.from(svg)).png().toFile(output);
console.log(`Saved cover to ${output}`);
