"use client";

import { useEffect, useMemo, useState } from "react";
import OrderEditor from "./order-editor";
import DownloadEditor from "./download-editor";
import { uploadProductImage } from "../../lib/product-image-upload";
import { getAdminUser, signOutAdmin, authenticateAdmin, deleteProduct, fetchFooterSettings, fetchHomepageSettings, fetchProducts, saveFooterSettings, saveHomepageSettings, saveProduct as saveRemoteProduct } from "../../lib/products-api";

const STORAGE_KEY = "aplikasiid_products";
const PAGE_SIZE = 15;
const defaultHeroSettings = {
  title: "Kebutuhan Software",
  titleLineTwo: "untuk Kuliah hingga Kerja",
  description: "Temukan pilihan software untuk mengerjakan tugas, mengolah data penelitian, membuat desain, dan mendukung pekerjaan sehari-hari.",
  primaryLabel: "Mulai Belanja",
  primaryTarget: "produk",
  secondaryLabel: "Cek Pesanan",
  secondaryTarget: "bantuan",
  trustOne: "Full Version",
  trustTwo: "Aktivasi Cepat",
  trustThree: "Support Pelanggan",
  accountEnabled: false
};
const defaultFooterSettings = {
  brand: "Aplikasi.id",
  description: "Pusat software terpercaya untuk kebutuhan kerja dan bisnis.",
  copyright: "© 2026. Semua hak dilindungi.",
  whatsapp: "",
  tiktok: ""
};

const emptyProduct = {
  id: "",
  title: "",
  category: "Design",
  os: "Win & Mac",
  versions: "",
  description: "",
  seoTitle: "",
  seoDescription: "",
  compatibility: "",
  price: 0,
  originalPrice: 0,
  rating: 5,
  sales: 0,
  imageUrl: "/assets/logos/aplikasid.png",
  catalogImageUrl: "",
  buyUrl: "",
  color: "#2563eb",
  specs: []
};

const formatRp = (amount) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(amount) || 0);
const hasSortOrder = (value) => value !== "" && value !== null && value !== undefined && Number.isFinite(Number(value));
const withOrder = (items) => items.map((product, index) => ({ ...product, sortOrder: hasSortOrder(product.sortOrder) ? Number(product.sortOrder) : index }));
const normalizeFooterSettings = ({ email, ...settings }) => ({ ...defaultFooterSettings, ...settings, tiktok: settings.tiktok || settings.instagram || "" });
const mergeStoredOrder = (items) => {
  if (typeof window === "undefined") return withOrder(items);
  try {
    const remoteHasOrder = items.some((product) => hasSortOrder(product.sortOrder));
    if (remoteHasOrder) return withOrder(items).sort((a, b) => a.sortOrder - b.sortOrder);
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    const savedOrder = new Map(saved.map((product, index) => [product.id, hasSortOrder(product.sortOrder) ? Number(product.sortOrder) : index]));
    return withOrder(items).map((product, index) => ({ ...product, sortOrder: savedOrder.has(product.id) ? savedOrder.get(product.id) : index })).sort((a, b) => a.sortOrder - b.sortOrder);
  } catch {
    return withOrder(items);
  }
};

export default function AdminPage() {
  const [authReady, setAuthReady] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ login: "", password: "" });
  const [productList, setProductList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [uploading, setUploading] = useState(false);
  const [heroSettings, setHeroSettings] = useState(defaultHeroSettings);
  const [accountEnabled, setAccountEnabled] = useState(false);
  const [footerSettings, setFooterSettings] = useState(defaultFooterSettings);

  useEffect(() => {
    getAdminUser().then(setAdminUser).catch((error) => setNotice(error.message)).finally(() => setAuthReady(true));
    const savedHero = window.localStorage.getItem("aplikasiid_hero");
    if (savedHero) {
      const nextHero = { ...defaultHeroSettings, ...JSON.parse(savedHero) };
      setHeroSettings(nextHero);
      setAccountEnabled(nextHero.accountEnabled === true);
    }
    const savedFooter = window.localStorage.getItem("aplikasiid_footer");
    if (savedFooter) setFooterSettings(normalizeFooterSettings(JSON.parse(savedFooter)));
    fetchHomepageSettings()
      .then((settings) => {
        if (settings && !Array.isArray(settings)) {
          const nextHero = { ...defaultHeroSettings, ...settings };
          setHeroSettings(nextHero);
          setAccountEnabled(nextHero.accountEnabled === true);
          window.localStorage.setItem("aplikasiid_hero", JSON.stringify(nextHero));
        }
      })
      .catch(() => {});
    fetchFooterSettings()
      .then((settings) => {
        if (settings && !Array.isArray(settings)) {
          const nextFooter = normalizeFooterSettings(settings);
          setFooterSettings(nextFooter);
          window.localStorage.setItem("aplikasiid_footer", JSON.stringify(nextFooter));
        }
      })
      .catch(() => {});
    fetchProducts()
      .then((remoteProducts) => {
        const orderedProducts = mergeStoredOrder(remoteProducts);
        setProductList(orderedProducts);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orderedProducts));
      })
      .catch(() => setNotice("Supabase tidak dapat diakses. Coba muat ulang katalog."));
  }, []);

  const login = async (event) => {
    event.preventDefault();
    setNotice("Memeriksa akun...");
    try {
      const result = await authenticateAdmin(loginForm.login.trim(), loginForm.password);
      if (!result?.success) {
        setNotice(result?.message || "Login atau password salah.");
        return;
      }
      if (!result.role) {
        setNotice("Akun belum memiliki role admin.");
        return;
      }
      if (!["admin", "owner"].includes(String(result.role).trim().toLowerCase())) {
        setNotice(`Role "${result.role}" tidak memiliki akses dashboard.`);
        return;
      }
      const user = { login: result.login || loginForm.login.trim(), role: String(result.role).toLowerCase() };
      setAdminUser(user);
      setNotice("");
    } catch {
      setNotice("Login gagal. Periksa email, password, dan konfigurasi Supabase.");
    }
  };

  const logout = async () => {
    try {
      await signOutAdmin();
      setAdminUser(null);
    } catch (error) { setNotice(error.message); }
  };

  const filteredProducts = useMemo(() => {
    const query = search.toLowerCase().trim();
    return productList.filter((product) => !query || `${product.title} ${product.category} ${product.id}`.toLowerCase().includes(query));
  }, [productList, search]);

  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const visibleProducts = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const persist = (nextProducts, message) => {
    const orderedProducts = withOrder(nextProducts);
    setProductList(orderedProducts);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orderedProducts));
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2500);
  };

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const updateHero = (field, value) => setHeroSettings((current) => ({ ...current, [field]: value }));
  const updateFooter = (field, value) => setFooterSettings((current) => ({ ...current, [field]: value }));

  const saveHero = async (event) => {
    event.preventDefault();
    const nextHeroSettings = { ...heroSettings, accountEnabled };
    try {
      await saveHomepageSettings(nextHeroSettings);
      setHeroSettings(nextHeroSettings);
      window.localStorage.setItem("aplikasiid_hero", JSON.stringify(nextHeroSettings));
      setNotice("Pengaturan homepage berhasil disimpan.");
    } catch {
      window.localStorage.setItem("aplikasiid_hero", JSON.stringify(nextHeroSettings));
      setNotice("Tersimpan di browser saja. Gagal menyimpan ke Supabase.");
    }
    window.setTimeout(() => setNotice(""), 3000);
  };

  const saveAccountFeature = async (event) => {
    event.preventDefault();
    try {
      const savedSettings = await fetchHomepageSettings();
      const nextSettings = { ...defaultHeroSettings, ...savedSettings, accountEnabled };
      await saveHomepageSettings(nextSettings);
      setHeroSettings((current) => ({ ...current, accountEnabled }));
      window.localStorage.setItem("aplikasiid_hero", JSON.stringify(nextSettings));
      setNotice(accountEnabled ? "Fitur Akun Saya berhasil dimunculkan." : "Fitur Akun Saya berhasil disembunyikan.");
    } catch {
      setNotice("Gagal menyimpan pengaturan Akun Saya. Periksa koneksi lalu coba lagi.");
    }
    window.setTimeout(() => setNotice(""), 3000);
  };

  const saveFooter = async (event) => {
    event.preventDefault();
    try {
      await saveFooterSettings(footerSettings);
      window.localStorage.setItem("aplikasiid_footer", JSON.stringify(footerSettings));
      setNotice("Pengaturan footer berhasil disimpan.");
    } catch {
      window.localStorage.setItem("aplikasiid_footer", JSON.stringify(footerSettings));
      setNotice("Tersimpan di browser saja. Gagal menyimpan ke Supabase.");
    }
    window.setTimeout(() => setNotice(""), 3000);
  };

  const editProduct = (product) => {
    if (uploading) return;
    setEditingId(product.id);
    setForm({ ...product, specs: product.specs || [] });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const startNew = () => {
    if (uploading) return;
    setEditingId(null);
    setForm({ ...emptyProduct, id: `app-${Date.now()}` });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveProduct = async (event) => {
    event.preventDefault();
    if (uploading) return;
    const product = {
      ...form,
      id: form.id.trim() || `app-${Date.now()}`,
      title: form.title.trim(),
      price: Number(form.price) || 0,
      originalPrice: Number(form.originalPrice) || 0,
      rating: Number(form.rating) || 0,
      sales: Number(form.sales) || 0,
      versions: form.versions.trim(),
      description: (form.description || "").trim(),
      seoTitle: (form.seoTitle || "").trim(),
      seoDescription: (form.seoDescription || "").trim(),
      compatibility: (form.compatibility || "").trim(),
      specs: Array.isArray(form.specs) ? form.specs : form.specs.split(",").map((item) => item.trim()).filter(Boolean),
      imageUrl: form.imageUrl || form.catalogImageUrl || "/assets/logos/aplikasid.png"
    };
    if (!product.title) return;
    const nextProducts = editingId ? productList.map((item) => item.id === editingId ? product : item) : [product, ...productList];
    try {
      await saveRemoteProduct(product);
    } catch (error) {
      setNotice(error.message || "Gagal menyimpan ke Supabase.");
      return;
    }
    persist(nextProducts, editingId ? "Produk berhasil diperbarui." : "Produk baru berhasil ditambahkan.");
    setEditingId(null);
    setForm(emptyProduct);
    setPage(1);
  };

  const removeProduct = async (id) => {
    if (!window.confirm("Hapus produk ini dari katalog?")) return;
    try {
      await deleteProduct(id);
    } catch {
      setNotice("Gagal menghapus dari Supabase.");
      return;
    }
    persist(productList.filter((product) => product.id !== id), "Produk berhasil dihapus.");
    if (visibleProducts.length === 1 && page > 1) setPage(page - 1);
  };

  const resetProducts = async () => {
    if (uploading) return;
    try {
      const latest = await fetchProducts();
      persist(withOrder(latest), "Katalog terbaru dari Supabase sudah dimuat.");
      setEditingId(null);
      setForm(emptyProduct);
      setPage(1);
    } catch { setNotice("Gagal memuat katalog dari Supabase. Silakan coba lagi."); }
  };
  const readUpload = (field) => async (event) => {
    const input = event.target;
    const file = event.target.files?.[0];
    if (!file || uploading) return;
    setUploading(true);
    setNotice("Mengupload gambar ke Supabase...");
    try {
      const url = await uploadProductImage(file);
      updateField(field, url);
      setNotice("Gambar berhasil diupload. Simpan produk untuk menggunakan gambar ini.");
    } catch (error) {
      setNotice(error.message || "Upload gambar gagal. Silakan coba lagi.");
    } finally {
      input.value = "";
      setUploading(false);
    }
  };

  if (!authReady) return null;
  if (!adminUser) {
    return <main className="admin-login-page"><div className="admin-login-glow admin-login-glow-one" /><div className="admin-login-glow admin-login-glow-two" /><form className="admin-login-card" onSubmit={login}><div className="admin-login-brand"><span className="admin-login-logo"><img src="/untukFaviconfix.png" alt="Aplikasi.id" /></span><div><strong>Aplikasi.id</strong><small>CONTROL ROOM</small></div></div><div className="admin-login-heading"><p className="admin-eyebrow">RUANG ADMIN</p><h1>Selamat datang kembali</h1><p>Kelola katalog software Anda dengan aman dan praktis.</p></div><div className="admin-login-fields"><label>Email<input type="email" value={loginForm.login} onChange={(event) => setLoginForm({ ...loginForm, login: event.target.value })} autoComplete="username" placeholder="Masukkan email admin" required /></label><label>Password<input type="password" value={loginForm.password} onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })} autoComplete="current-password" placeholder="Masukkan password" required /></label></div><div className="admin-login-status"><span /> Login dengan Supabase Auth</div><button className="admin-login-submit" type="submit">Masuk ke Dashboard <span>→</span></button>{notice && <small className="admin-login-error">{notice}</small>}<a className="admin-login-back" href="/">← Kembali ke toko utama</a></form></main>;
  }

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <a className="admin-back" href="/">← Kembali ke toko</a>
          <p className="admin-eyebrow">APLIKASI.ID CONTROL ROOM</p>
          <h1>Dashboard Produk</h1>
          <p className="admin-subtitle">Kelola katalog, gambar, harga, dan tujuan tombol beli tanpa mengubah kode toko.</p>
        </div>
          <div className="admin-header-actions"><span className="admin-user-badge">{adminUser.login} · {adminUser.role}</span><button className="admin-primary" type="button" onClick={startNew}>+ Produk Baru</button><button className="admin-ghost" type="button" onClick={logout}>Keluar</button></div>
      </header>

      <section className="admin-stats" aria-label="Ringkasan katalog">
        <div><strong>{productList.length}</strong><span>Total produk</span></div>
        <div><strong>{productList.filter((product) => product.catalogImageUrl).length}</strong><span>Dengan katalog</span></div>
        <div><strong>{productList.filter((product) => product.buyUrl).length}</strong><span>URL beli aktif</span></div>
      </section>

      <DownloadEditor />

      <section className="admin-editor admin-hero-editor">
        <div className="admin-section-heading"><div><p className="admin-eyebrow">HOMEPAGE EDITOR</p><h2>Hero section</h2></div><span className="admin-editor-note">Perubahan tampil di bagian paling atas toko</span></div>
        <form className="admin-form" onSubmit={saveHero}>
          <label>Jumlah aplikasi (otomatis)<input value={`${productList.length.toLocaleString("id-ID")} Software Aktif`} readOnly /><small>Mengikuti total produk di katalog.</small></label>
          <label>Judul utama<input value={heroSettings.title} onChange={(event) => updateHero("title", event.target.value)} /></label>
          <label>Judul baris kedua<input value={heroSettings.titleLineTwo} onChange={(event) => updateHero("titleLineTwo", event.target.value)} /></label>
          <label className="admin-wide">Deskripsi<textarea value={heroSettings.description} onChange={(event) => updateHero("description", event.target.value)} /></label>
          <label>Teks tombol utama<input value={heroSettings.primaryLabel} onChange={(event) => updateHero("primaryLabel", event.target.value)} /></label>
          <label>Tujuan tombol utama<select value={heroSettings.primaryTarget} onChange={(event) => updateHero("primaryTarget", event.target.value)}><option value="produk">Produk</option><option value="bantuan">Bantuan</option><option value="garansi">Garansi</option></select></label>
          <label>Teks tombol kedua<input value={heroSettings.secondaryLabel} onChange={(event) => updateHero("secondaryLabel", event.target.value)} /></label>
          <label>Tujuan tombol kedua<select value={heroSettings.secondaryTarget} onChange={(event) => updateHero("secondaryTarget", event.target.value)}><option value="produk">Produk</option><option value="bantuan">Bantuan</option><option value="garansi">Garansi</option></select></label>
          <label>Trust badge 1<input value={heroSettings.trustOne} onChange={(event) => updateHero("trustOne", event.target.value)} /></label>
          <label>Trust badge 2<input value={heroSettings.trustTwo} onChange={(event) => updateHero("trustTwo", event.target.value)} /></label>
          <label>Trust badge 3<input value={heroSettings.trustThree} onChange={(event) => updateHero("trustThree", event.target.value)} /></label>
          <div className="admin-hero-mini-preview"><span>Preview</span><strong>{heroSettings.title}</strong><b>{heroSettings.titleLineTwo}</b><small>{heroSettings.description}</small></div>
          <div className="admin-form-actions"><button className="admin-primary" type="submit">Simpan Hero Homepage</button><button className="admin-ghost" type="button" onClick={() => setHeroSettings(defaultHeroSettings)}>Kembalikan Default</button></div>
        </form>
      </section>

      <section className="admin-editor">
        <div className="admin-section-heading"><div><p className="admin-eyebrow">FITUR TOKO</p><h2>Visibilitas Akun Saya</h2></div><span className="admin-editor-note">Aktifkan lagi kapan saja dari sini</span></div>
        <form className="admin-form" onSubmit={saveAccountFeature}>
          <label className="admin-wide admin-feature-toggle" style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 10 }}><input type="checkbox" style={{ width: "auto", margin: 0 }} checked={accountEnabled} onChange={(event) => setAccountEnabled(event.target.checked)} /><span>Tampilkan fitur Akun Saya di toko dan pusat bantuan</span></label>
          <p className="admin-wide admin-feature-help">Saat dimatikan, tautan Akun Saya disembunyikan dan halaman akun mengarahkan pengunjung kembali ke toko.</p>
          <div className="admin-form-actions"><button className="admin-primary" type="submit">Simpan Pengaturan Fitur</button></div>
        </form>
      </section>

      <section className="admin-editor admin-footer-editor">
        <div className="admin-section-heading"><div><p className="admin-eyebrow">HOMEPAGE EDITOR</p><h2>Pengaturan footer</h2></div><span className="admin-editor-note">Konten bagian paling bawah toko</span></div>
        <form className="admin-form" onSubmit={saveFooter}>
          <label>Nama brand<input value={footerSettings.brand} onChange={(event) => updateFooter("brand", event.target.value)} /></label>
          <label className="admin-wide">Deskripsi footer<textarea value={footerSettings.description} onChange={(event) => updateFooter("description", event.target.value)} /></label>
          <label className="admin-wide">Teks copyright<input value={footerSettings.copyright} onChange={(event) => updateFooter("copyright", event.target.value)} /></label>
          <label>URL WhatsApp<input type="url" value={footerSettings.whatsapp} onChange={(event) => updateFooter("whatsapp", event.target.value)} placeholder="https://wa.me/..." /></label>
          <label>URL TikTok<input type="url" value={footerSettings.tiktok} onChange={(event) => updateFooter("tiktok", event.target.value)} placeholder="https://tiktok.com/@..." /></label>
          <div className="admin-footer-mini-preview"><strong>{footerSettings.brand}</strong><small>{footerSettings.description}</small><span>{footerSettings.copyright}</span></div>
          <div className="admin-form-actions"><button className="admin-primary" type="submit">Simpan Footer</button><button className="admin-ghost" type="button" onClick={() => setFooterSettings(defaultFooterSettings)}>Kembalikan Default</button></div>
        </form>
      </section>

      <section className="admin-editor">
        <div className="admin-section-heading"><div><p className="admin-eyebrow">{editingId ? "EDIT PRODUK" : "TAMBAH PRODUK"}</p><h2>{editingId ? "Perbarui detail produk" : "Buat produk baru"}</h2></div>{editingId && <button className="admin-ghost" type="button" disabled={uploading} onClick={() => { setEditingId(null); setForm(emptyProduct); }}>Batal edit</button>}</div>
        <form className="admin-form" onSubmit={saveProduct}>
          <label>ID produk<input value={form.id} onChange={(event) => updateField("id", event.target.value)} placeholder="app-produk-baru" readOnly={Boolean(editingId)} required />{editingId && <small>ID produk membentuk URL halaman dan tidak dapat diubah setelah dibuat.</small>}</label>
          <label>Nama produk<input value={form.title} onChange={(event) => updateField("title", event.target.value)} placeholder="Nama software" required /></label>
          <label>Kategori<select value={form.category} onChange={(event) => updateField("category", event.target.value)}><option>Design</option><option>Engineering</option><option>Video</option><option>Office</option><option>Utility</option></select></label>
          <label>Sistem operasi<input value={form.os} onChange={(event) => updateField("os", event.target.value)} placeholder="Win & Mac" /></label>
          <label className="admin-wide">Deskripsi unik produk<textarea value={form.description || ""} onChange={(event) => updateField("description", event.target.value)} placeholder="Jelaskan kegunaan produk ini, siapa yang terbantu, dan hal khusus yang perlu diketahui sebelum membeli." /></label>
          <label className="admin-wide">Kompatibilitas &amp; persyaratan<textarea value={form.compatibility || ""} onChange={(event) => updateField("compatibility", event.target.value)} placeholder="Tulis versi Windows/macOS, kebutuhan perangkat, atau batasan versi yang sudah diverifikasi." /></label>
          <label>Judul SEO opsional<input value={form.seoTitle || ""} onChange={(event) => updateField("seoTitle", event.target.value)} placeholder="Otomatis memakai nama produk" /></label>
          <label className="admin-wide">Deskripsi SEO opsional<textarea value={form.seoDescription || ""} onChange={(event) => updateField("seoDescription", event.target.value)} placeholder="Ringkasan unik untuk hasil pencarian (sekitar 150 karakter)." /></label>
          <label>Harga jual<input type="number" min="0" value={form.price} onChange={(event) => updateField("price", event.target.value)} /></label>
          <label>Harga coret<input type="number" min="0" value={form.originalPrice} onChange={(event) => updateField("originalPrice", event.target.value)} /></label>
          <label>Rating<input type="number" min="0" max="5" step="0.1" value={form.rating} onChange={(event) => updateField("rating", event.target.value)} /></label>
          <label>Terjual<input type="number" min="0" value={form.sales} onChange={(event) => updateField("sales", event.target.value)} /></label>
          <label className="admin-wide">Daftar versi<textarea value={form.versions} onChange={(event) => updateField("versions", event.target.value)} placeholder="2024 - 2025 - 2026" /></label>
          <label className="admin-wide">Spesifikasi <small>Pisahkan dengan koma</small><textarea value={Array.isArray(form.specs) ? form.specs.join(", ") : form.specs} onChange={(event) => updateField("specs", event.target.value)} placeholder="Full Version, Instal Mudah, Garansi" /></label>
          <label>URL tombol beli <small>Contoh https://...</small><input type="url" value={form.buyUrl || ""} onChange={(event) => updateField("buyUrl", event.target.value)} placeholder="https://website-pembayaran.com" /></label>
          <label>URL gambar logo<input value={form.imageUrl?.startsWith("data:image/") ? "" : form.imageUrl || ""} onChange={(event) => updateField("imageUrl", event.target.value)} placeholder={form.imageUrl?.startsWith("data:image/") ? "Gambar upload digunakan" : "/assets/logos/app.png"} />{form.imageUrl?.startsWith("data:image/") && <small>Logo menggunakan gambar upload. Isi URL untuk menggantinya.</small>}</label>
          <label>URL gambar katalog<input disabled={uploading} value={form.catalogImageUrl?.startsWith("data:image/") ? "" : form.catalogImageUrl || ""} onChange={(event) => updateField("catalogImageUrl", event.target.value)} placeholder={form.catalogImageUrl?.startsWith("data:image/") ? "Gambar upload digunakan" : "/assets/katalogApp.png"} /><small>{form.catalogImageUrl?.startsWith("data:image/") ? "Katalog menggunakan gambar upload. Isi URL untuk menggantinya." : "Isi URL gambar atau pilih file di sebelahnya."}</small></label>
          <label>Upload gambar katalog<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" disabled={uploading} onChange={readUpload("catalogImageUrl")} /><small>{uploading ? "Mengupload gambar..." : "PNG, JPG, WebP, GIF · Maksimal 5 MB. Setelah upload, simpan produk."}</small></label>
          <label>Warna logo<input type="color" value={form.color || "#2563eb"} onChange={(event) => updateField("color", event.target.value)} /></label>
          <div className="admin-preview"><span>Preview katalog</span>{form.catalogImageUrl ? <img src={form.catalogImageUrl} alt="Preview katalog" /> : <strong>Belum ada gambar</strong>}</div>
          <div className="admin-form-actions"><button className="admin-primary" type="submit" disabled={uploading}>{uploading ? "Mengupload gambar..." : editingId ? "Simpan Perubahan" : "Tambah Produk"}</button><button className="admin-ghost" type="button" onClick={resetProducts}>Muat Ulang dari Supabase</button></div>
        </form>
      </section>

      <section className="admin-list-section">
        <div className="admin-section-heading"><div><p className="admin-eyebrow">KATALOG</p><h2>Semua produk</h2></div><label className="admin-search"><span>⌕</span><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Cari produk..." /></label></div>
        <div className="admin-order-toolbar"><p>Atur posisi aplikasi di seluruh katalog, termasuk antarhalaman.</p><button className="admin-primary" type="button" disabled={productList.length < 2} onClick={() => setOrdering(true)}>↕ Atur Urutan</button></div>
        <div className="admin-product-grid">{visibleProducts.map((product) => <article className="admin-product-row" key={product.id}><div className="admin-product-image"><img src={product.catalogImageUrl || product.imageUrl} alt="" loading="lazy" /></div><div className="admin-product-info"><strong>{product.title}</strong><span>{product.category} · {formatRp(product.price)}</span><small>Urutan {productList.findIndex((item) => item.id === product.id) + 1} · {product.buyUrl ? "URL beli aktif" : "Masuk keranjang"}</small></div><div className="admin-row-actions"><button className="admin-ghost" type="button" onClick={() => editProduct(product)}>Edit</button><button className="admin-danger" type="button" onClick={() => removeProduct(product.id)}>Hapus</button></div></article>)}</div>
        {visibleProducts.length === 0 && <div className="admin-empty">Produk tidak ditemukan.</div>}
        <div className="admin-pagination"><span>Menampilkan {visibleProducts.length} dari {filteredProducts.length} produk</span><div><button className="admin-ghost" type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>← Sebelumnya</button><strong>Halaman {page} / {pageCount}</strong><button className="admin-ghost" type="button" disabled={page === pageCount} onClick={() => setPage((current) => current + 1)}>Berikutnya →</button></div></div>
      </section>
      {ordering && <OrderEditor products={productList} onClose={() => setOrdering(false)} onSaved={(ordered) => { persist(ordered, "Urutan berhasil disimpan dan katalog diperbarui."); setForm((current) => { const updated = ordered.find((item) => item.id === current.id); return updated ? { ...current, sortOrder: updated.sortOrder } : current; }); setOrdering(false); setPage(1); }} />}
      {notice && <div className="admin-toast">✓ {notice}</div>}
    </main>
  );
}
