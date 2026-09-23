"use client";

import { useEffect, useRef, useState } from "react";
import { CloseIcon } from "../icons";
import { saveProducts } from "../../lib/products-api";

export function moveItem(items, id, target) {
  const source = items.findIndex((item) => item.id === id);
  if (source < 0 || target < 0 || target >= items.length || source === target) return items;
  const next = [...items];
  const [item] = next.splice(source, 1);
  next.splice(target, 0, item);
  return next;
}

export default function OrderEditor({ products, onClose, onSaved }) {
  const dialog = useRef(null);
  const savingRef = useRef(false);
  const [items, setItems] = useState(products);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [dragged, setDragged] = useState(null);
  const [target, setTarget] = useState(null);
  const changed = items.some((item, index) => item.id !== products[index]?.id);

  useEffect(() => {
    dialog.current.showModal();
  }, []);

  const move = (id, position) => {
    if (savingRef.current) return;
    setItems((current) => moveItem(current, id, position));
    setError("");
  };

  const save = async () => {
    if (savingRef.current || !changed) return;
    savingRef.current = true;
    setSaving(true);
    setError("");
    const ordered = items.map((item, index) => ({ ...item, sortOrder: index }));
    try {
      await saveProducts(ordered);
      onSaved(ordered);
    } catch {
      setError("Urutan belum tersimpan. Susunanmu tetap di sini; silakan coba simpan lagi.");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  return <dialog ref={dialog} className="order-dialog" aria-labelledby="order-title" onCancel={(event) => { event.preventDefault(); if (!savingRef.current) onClose(); }}>
    <header className="order-header"><div><h2 id="order-title">Atur urutan aplikasi</h2><p>Tarik baris di desktop, gunakan panah, atau pilih posisi tujuan. Nomor 1 tampil paling awal di katalog.</p></div><button type="button" className="admin-ghost order-close" disabled={saving} onClick={onClose} aria-label="Tutup tanpa menyimpan"><CloseIcon /></button></header>
    <div className="order-list" aria-busy={saving}>
      {items.map((item, index) => <div key={item.id} className={`order-row${target === item.id ? " order-drop-target" : ""}${dragged === item.id ? " order-dragging" : ""}`} onDragOver={(event) => { if (dragged && !saving) { event.preventDefault(); setTarget(item.id); } }} onDrop={(event) => { event.preventDefault(); if (dragged) move(dragged, index); setDragged(null); setTarget(null); }}>
        <span className="order-grip" draggable={!saving} title="Tarik untuk memindahkan" onDragStart={(event) => { event.dataTransfer.setData("text/plain", item.id); event.dataTransfer.effectAllowed = "move"; setDragged(item.id); }} onDragEnd={() => { setDragged(null); setTarget(null); }}>⠿</span>
        <span className="order-number">{index + 1}</span>
        <img src={item.catalogImageUrl || item.imageUrl} alt="" loading="lazy" width="48" height="48" draggable={false} />
        <div className="order-name"><strong>{item.title}</strong><small>{item.category} · Halaman katalog {Math.floor(index / 12) + 1}</small></div>
        <div className="order-controls"><button type="button" className="admin-ghost" disabled={saving || index === 0} onClick={() => move(item.id, index - 1)} aria-label={`Naikkan ${item.title}`}>↑</button><button type="button" className="admin-ghost" disabled={saving || index === items.length - 1} onClick={() => move(item.id, index + 1)} aria-label={`Turunkan ${item.title}`}>↓</button><label>Posisi<select value={index} disabled={saving} onChange={(event) => move(item.id, Number(event.target.value))} aria-label={`Posisi ${item.title}`}>{items.map((_, position) => <option key={position} value={position}>{position + 1}</option>)}</select></label></div>
      </div>)}
    </div>
    <footer className="order-footer"><p role="status">{saving ? "Menyimpan urutan…" : changed ? "Ada perubahan yang belum disimpan." : `${items.length} aplikasi · Urutan sesuai katalog saat ini.`}</p>{error && <p role="alert" className="order-error">{error}</p>}<div><button type="button" className="admin-ghost" disabled={saving} onClick={onClose}>Batal</button><button type="button" className="admin-primary" disabled={saving || !changed} onClick={save}>{saving ? "Menyimpan…" : "Simpan Urutan"}</button></div></footer>
  </dialog>;
}
