// Isolated PostgreSQL test; never connects to production.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const { PGlite } = await import(process.env.PGLITE_MODULE || "@electric-sql/pglite");
const db = new PGlite();
try {
  await db.exec(`
    create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth;
    create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth to authenticated;
    insert into auth.users values ('00000000-0000-0000-0000-000000000001'), ('00000000-0000-0000-0000-000000000002');
  `);
  await db.exec(await readFile(new URL("../supabase/schema.sql", import.meta.url), "utf8"));
  const sql = await readFile(new URL("../supabase/product-downloads.sql", import.meta.url), "utf8");
  await db.exec(sql); await db.exec(sql);
  await db.exec(`insert into public.admin_users values ('00000000-0000-0000-0000-000000000001','owner');
    set role authenticated; set request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';
    insert into public.product_downloads values ('product-a','Product A','https://drive.google.com/file/d/example/view',true);`);
  assert.equal((await db.query("select * from public.product_downloads")).rows.length, 1);
  await db.exec("update public.product_downloads set description = 'Panduan instalasi untuk pembeli' where lynk_item_id = 'product-a'");
  assert.equal((await db.query("select description from public.product_downloads")).rows[0].description, "Panduan instalasi untuk pembeli");
  await assert.rejects(db.exec("update public.product_downloads set description = repeat('x', 3001)"), /check constraint/);
  await db.exec("update public.product_downloads set active = false where lynk_item_id = 'product-a'");
  assert.equal((await db.query("select active from public.product_downloads")).rows[0].active, false);
  await db.exec("reset role; set role authenticated; set request.jwt.claim.sub = '00000000-0000-0000-0000-000000000002'");
  assert.equal((await db.query("select * from public.product_downloads")).rows.length, 0);
  await assert.rejects(db.exec("insert into public.product_downloads values ('forged','Fake','https://drive.google.com/file/d/fake/view',true)"), /row-level security/);
  await db.exec("update public.product_downloads set active = true; delete from public.product_downloads");
  await db.exec("reset role; set role anon");
  await assert.rejects(db.query("select * from public.product_downloads"), /permission denied/);
  await db.exec("reset role; set role service_role");
  const rows = (await db.query("select * from public.product_downloads")).rows;
  assert.equal(rows.length, 1); assert.equal(rows[0].active, false);
  console.log("PASS: repeatable migration, admin writes, customer read/write isolation, anonymous denied, service access.");
} finally { await db.close(); }
