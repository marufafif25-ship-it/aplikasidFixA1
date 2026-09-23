// Ekspor data publik Apps Script menjadi SQL; tidak menyalin akun/password.
import { writeFile } from 'node:fs/promises';
const endpoint = process.env.LEGACY_PRODUCTS_API_URL;
if (!endpoint) throw new Error('Isi LEGACY_PRODUCTS_API_URL dengan URL deployment Apps Script lama.');
const literal = (value) => "'" + String(value).replaceAll("'", "''") + "'";
async function read(resource) {
  const url = new URL(endpoint);
  if (resource) url.searchParams.set('resource', resource);
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`Ekspor ${resource || 'products'} gagal: ${response.status}`);
  return response.json();
}
const [products, homepage, footer, faq] = await Promise.all([read(), read('homepage'), read('footer'), read('faq')]);
if (!Array.isArray(products) || !Array.isArray(faq)) throw new Error('Format produk/FAQ tidak valid.');
for (const settings of [homepage, footer]) {
  if (!settings || typeof settings !== 'object' || Array.isArray(settings)) throw new Error('Format pengaturan tidak valid.');
}
const sql = ['begin;', 'set local standard_conforming_strings = on;'];
products.forEach((product, index) => {
  if (!product.id) throw new Error(`Produk ${index} tidak memiliki ID.`);
  const order = Number.isFinite(Number(product.sortOrder)) && product.sortOrder !== '' ? Math.trunc(Number(product.sortOrder)) : index;
  sql.push(`insert into public.products(id,data,sort_order) values (${literal(product.id)},${literal(JSON.stringify({ ...product, sortOrder: order }))}::jsonb,${order}) on conflict (id) do nothing;`);
});
for (const [id, data] of [['homepage', homepage], ['footer', footer]]) {
  sql.push(`insert into public.site_settings(id,data) values (${literal(id)},${literal(JSON.stringify(data))}::jsonb) on conflict (id) do nothing;`);
}
faq.forEach((item, index) => {
  const order = Math.trunc(Number(item.sortOrder) || 0);
  const active = item.active !== false && !['false', '0'].includes(String(item.active).toLowerCase());
  sql.push(`insert into public.chat_faq(id,data,active,sort_order) values (${literal(item.id || `faq-${index}`)},${literal(JSON.stringify(item))}::jsonb,${active},${order}) on conflict (id) do nothing;`);
});
sql.push('commit;');
await writeFile('supabase/import-data.sql', sql.join('\n') + '\n');
console.log(`SQL siap: ${products.length} produk, ${faq.length} FAQ, dan pengaturan homepage/footer. Data dengan ID yang sudah ada tidak ditimpa.`);
