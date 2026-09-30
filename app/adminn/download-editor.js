"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "../../lib/supabase";
import { isDriveUrl } from "../../lib/product-downloads.mjs";

async function request(options = {}) {
  const { data: { session } } = await getSupabase().auth.getSession();
  if (!session) throw new Error("Silakan login kembali.");
  const response = await fetch("/api/admin/downloads", { ...options, headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` }, cache: "no-store" });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error);
  return result;
}

export default function DownloadEditor() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState("");
  const [form, setForm] = useState({ lynk_item_id: "", title: "", description: "", drive_url: "", active: true });
  async function load() {
    setBusy(true);
    try { const result = await request(); setRows(result.downloads); setStatus(""); }
    catch (error) { setStatus(error.message); }
    finally { setBusy(false); }
  }
  useEffect(() => { load(); }, []);
  async function save(event) {
    event.preventDefault();
    if (!isDriveUrl(form.drive_url.trim())) { setStatus("Gunakan link https://drive.google.com/ dari produk Lynk."); return; }
    setBusy(true);
    try {
      const row = { ...form, lynk_item_id: form.lynk_item_id.trim(), title: form.title.trim(), drive_url: form.drive_url.trim() };
      await request({ method: "POST", body: JSON.stringify(row) });
      setRows((current) => [...current.filter((item) => item.lynk_item_id !== row.lynk_item_id), row].sort((a, b) => a.title.localeCompare(b.title)));
      setSelected(row.lynk_item_id); setForm(row); setStatus("Link unduhan berhasil disimpan.");
    } catch (error) { setStatus(error.message); }
    finally { setBusy(false); }
  }
  return <section className="admin-editor">
    <div className="admin-section-heading"><div><p className="admin-eyebrow">UNDUHAN PEMBELIAN</p><h2>Link Google Drive produk Lynk</h2></div><button className="admin-ghost" type="button" onClick={load} disabled={busy}>Muat ulang</button></div>
    <p>Pilih produk yang sudah dibeli, lalu isi keterangan dan link Google Drive. Cukup simpan sekali per produk; semua pembeli produk tersebut akan melihatnya saat mengecek email checkout.</p>
    <form className="admin-form" onSubmit={save}>
      <label>Pilih produk<select value={selected} disabled={busy} onChange={(event) => { const id = event.target.value; setSelected(id); setForm(rows.find((row) => row.lynk_item_id === id) || { lynk_item_id: "", title: "", description: "", drive_url: "", active: true }); }}><option value="">Tambahkan ID produk secara manual</option>{rows.map((row) => <option key={row.lynk_item_id} value={row.lynk_item_id}>{row.drive_url ? (row.active ? "✓ " : "Nonaktif · ") : "Belum diisi · "}{row.title}</option>)}</select></label>
      <label>ID item Lynk<input value={form.lynk_item_id} maxLength={256} required readOnly={Boolean(selected)} onChange={(event) => setForm({ ...form, lynk_item_id: event.target.value })} /><small>Gunakan nilai uuid di items transaksi Lynk, bukan kode pendek URL checkout.</small></label>
      <label>Nama produk<input value={form.title} maxLength={500} required onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
      <label>Keterangan untuk pembeli<textarea rows={4} maxLength={3000} placeholder="Contoh: Berisi SPSS untuk Windows dan panduan instalasi. Baca petunjuk sebelum mengunduh." value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /><small>Ditampilkan bersama tombol unduhan, maksimal 3.000 karakter.</small></label>
      <label>Link Google Drive<input type="url" placeholder="https://drive.google.com/drive/folders/..." value={form.drive_url} maxLength={2048} required onChange={(event) => setForm({ ...form, drive_url: event.target.value })} /></label>
      <label>Status link<select value={String(form.active)} onChange={(event) => setForm({ ...form, active: event.target.value === "true" })}><option value="true">Aktif</option><option value="false">Nonaktif</option></select></label>
      <div className="admin-form-actions"><button className="admin-primary" disabled={busy} type="submit">{busy ? "Memproses…" : "Simpan link unduhan"}</button></div>
    </form>
    {status && <p role="status">{status}</p>}
  </section>;
}
