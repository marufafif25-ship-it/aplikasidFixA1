// Isolated PostgreSQL test; never connects to the real Supabase project.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const { PGlite } = await import(process.env.PGLITE_MODULE || "@electric-sql/pglite");
const db = new PGlite();
try {
  await db.exec(`
    create role anon;
    create role authenticated;
    create role service_role bypassrls;
    create schema auth;
    create table auth.users (id uuid primary key, email text, email_confirmed_at timestamptz, is_anonymous boolean default false);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth to authenticated;
    grant execute on function auth.uid() to authenticated;
    insert into auth.users values
      ('00000000-0000-0000-0000-000000000001','a@example.com',now(),false),
      ('00000000-0000-0000-0000-000000000002','b@example.com',now(),false),
      ('00000000-0000-0000-0000-000000000003','a@example.com',null,false),
      ('00000000-0000-0000-0000-000000000004','a@example.com',now(),true);
  `);
  const migration = await readFile(new URL("../supabase/lynk-orders.sql", import.meta.url), "utf8");
  await db.exec(migration);
  await db.exec(migration); // migration must be repeatable
  await db.exec(`
    set role service_role;
    insert into public.lynk_orders(ref_id,message_id,customer_email,items,totals)
      values ('order-a','message-a','a@example.com','[]','{}'), ('order-b','message-b','b@example.com','[]','{}');
    insert into public.lynk_orders(ref_id,message_id,customer_email,items,totals)
      values ('order-a','message-repeated','b@example.com','[]','{}') on conflict (ref_id) do nothing;
    reset role;
  `);
  const stored = await db.query("select customer_email from public.lynk_orders where ref_id = 'order-a'");
  assert.equal(stored.rows[0].customer_email, "a@example.com");
  assert.equal((await db.query("select count(*)::int as n from public.lynk_orders")).rows[0].n, 2);
  for (const [suffix, expected] of [["1", ["order-a"]], ["2", ["order-b"]], ["3", []], ["4", []]]) {
    await db.exec(`set role authenticated; set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000${suffix}';`);
    const result = await db.query("select ref_id from public.lynk_orders order by ref_id");
    assert.deepEqual(result.rows.map((row) => row.ref_id), expected);
    await db.exec("reset role");
  }
  await db.exec("set role authenticated; set request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001'");
  for (const sql of [
    "insert into public.lynk_orders(ref_id,message_id,customer_email,items,totals) values('forged','fake','a@example.com','[]','{}')",
    "update public.lynk_orders set customer_email='a@example.com' where ref_id='order-b'",
    "delete from public.lynk_orders where ref_id='order-a'",
    "select * from auth.users",
  ]) await assert.rejects(db.query(sql), /permission denied/);
  await db.exec("reset role; set role anon");
  await assert.rejects(db.query("select * from public.lynk_orders"), /permission denied/);
  await assert.rejects(db.query("select public.verified_customer_email()"), /permission denied/);
  console.log("PASS: repeatable migration; service-role insert; duplicate preserves owner; A/B isolation; unverified/anonymous denied; customer writes denied; auth.users private.");
} finally { await db.close(); }
