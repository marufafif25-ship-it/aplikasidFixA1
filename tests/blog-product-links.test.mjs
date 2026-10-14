import test from "node:test";
import assert from "node:assert/strict";
import { BLOG_SEED_POSTS } from "../lib/blog-seed.mjs";
import { getBlogProductLinks, loadBlogProductLinks } from "../lib/blog-product-links.mjs";

const catalog = [
  ["app-office", "Microsoft Office"],
  ["app-spssmac", "SPSS untuk Mac"],
  ["app-1790154210043", "SPSS untuk Windows"],
  ["app-photoshop", "Adobe Photoshop"],
  ["app-lightroom", "Lightroom Classic"],
  ["app-coreldraw", "CorelDRAW"],
  ["app-autocad", "AutoCAD"],
  ["app-sketchup", "SketchUp"],
  ["app-davinci", "DaVinci Resolve Studio"],
  ["app-1788704020346", "Adobe Acrobat Pro"],
  ["app-1788703953321", "Nitro PDF Pro"],
  ["app-mendeley", "Mendeley Desktop"],
  ["app-premiere", "Adobe Premiere Pro"],
  ["app-1791301337000", "Adobe Illustrator"],
  ["app-1791301758757", "Adobe After Effects"]
].map(([id, title]) => ({ id, title }));

const officeGuide = {
  slug: "panduan-memilih-software-office-untuk-kuliah-dan-kerja",
  title: "Panduan Memilih Software Office untuk Kuliah dan Kerja",
  published: true
};

const officeTutorialSlugs = [
  "cara-membuat-daftar-isi-otomatis-di-word-untuk-skripsi",
  "cara-membuat-nomor-halaman-word-berbeda-setiap-bab",
  "cara-merapikan-data-excel-sebelum-dianalisis",
  "cara-membuat-pivot-table-excel-untuk-laporan",
  "cara-memilih-grafik-excel-agar-data-mudah-dibaca",
  "cara-membuat-presentasi-powerpoint-yang-jelas-dan-aksesibel",
  "cara-mengatur-catatan-kuliah-di-onenote",
  "cara-mengelola-versi-file-di-google-drive-untuk-tim"
];

test("all thirty articles offer one to three distinct links to available products", () => {
  assert.equal(BLOG_SEED_POSTS.length, 30);

  for (const post of BLOG_SEED_POSTS) {
    const links = getBlogProductLinks(post.slug, catalog, BLOG_SEED_POSTS);
    assert.ok(links, `${post.slug} should have related products`);
    assert.ok(links.intro.trim(), `${post.slug} should explain the product connection`);
    assert.ok(links.products.length >= 1 && links.products.length <= 3, post.slug);
    assert.equal(new Set(links.products.map(({ id }) => id)).size, links.products.length, post.slug);

    for (const product of links.products) {
      const available = catalog.find(({ id }) => id === product.id);
      assert.ok(available, `${post.slug} must link to a current catalog product`);
      assert.equal(product.title, available.title);
      assert.equal(product.href, `/produk/${encodeURIComponent(available.id)}`);
    }
  }
});

test("Illustrator and After Effects tutorials recommend the software being taught", () => {
  const recommendations = [
    ["cara-menyiapkan-artboard-illustrator-untuk-desain-web", "app-1791301337000"],
    ["cara-membuat-animasi-teks-sederhana-di-after-effects", "app-1791301758757"],
    ["cara-export-video-after-effects-dengan-render-queue", "app-1791301758757"]
  ];

  for (const [slug, expectedId] of recommendations) {
    const links = getBlogProductLinks(slug, catalog);
    assert.ok(links.products.some(({ id }) => id === expectedId), slug);
  }
});

test("SPSS tutorials let readers choose a Windows or Mac product", () => {
  const slugs = [
    "cara-menyiapkan-data-kuesioner-untuk-analisis-spss",
    "cara-mengatur-variabel-di-spss-untuk-penelitian",
    "cara-membaca-tabel-frekuensi-spss-untuk-penelitian"
  ];

  for (const slug of slugs) {
    const { products } = getBlogProductLinks(slug, catalog);
    assert.ok(products.some(({ id, title }) => id === "app-spssmac" && title === "SPSS untuk Mac"), slug);
    assert.ok(products.some(({ id, title }) => id === "app-1790154210043" && title === "SPSS untuk Windows"), slug);
  }
});

test("removed catalog products disappear without hiding an available alternative", () => {
  const slug = "photoshop-atau-lightroom-memilih-alur-edit-foto";
  const remainingCatalog = catalog.filter(({ id }) => id !== "app-photoshop");
  const links = getBlogProductLinks(slug, remainingCatalog);

  assert.deepEqual(links.products, [{
    id: "app-lightroom",
    title: "Lightroom Classic",
    href: "/produk/app-lightroom"
  }]);
  assert.equal(getBlogProductLinks(slug, []), null);
});

test("product labels reflect current catalog data instead of a saved marketing title", () => {
  const updatedTitle = "Microsoft Office untuk Windows dan Mac — pilihan terbaru";
  const links = getBlogProductLinks(officeTutorialSlugs[0], [{ id: "app-office", title: updatedTitle }]);

  assert.deepEqual(links.products, [{
    id: "app-office",
    title: updatedTitle,
    href: "/produk/app-office"
  }]);
});

test("unmapped article slugs receive no unrelated products", () => {
  for (const slug of ["artikel-baru", "constructor", "__proto__", "toString", "", undefined]) {
    assert.equal(getBlogProductLinks(slug, catalog, [officeGuide]), null, String(slug));
  }
});

test("all eight Office tutorials link to the published selection guide", () => {
  const currentGuide = { ...officeGuide, title: "Panduan Office yang sudah diperbarui" };

  for (const slug of officeTutorialSlugs) {
    const links = getBlogProductLinks(slug, catalog, [currentGuide]);
    assert.deepEqual(links.guide, {
      title: currentGuide.title,
      href: `/blog/${officeGuide.slug}`
    }, slug);
  }
});

test("missing or unpublished Office guides are not advertised", () => {
  const articleSlug = officeTutorialSlugs[0];
  const possiblePosts = [
    [],
    [{ ...officeGuide, published: false }],
    [{ slug: officeGuide.slug, title: officeGuide.title }],
    [{ ...officeGuide, slug: "panduan-lain" }]
  ];

  for (const posts of possiblePosts) {
    const links = getBlogProductLinks(articleSlug, catalog, posts);
    assert.equal(links.guide, null);
    assert.ok(links.products.some(({ id }) => id === "app-office"));
  }
});

test("the Office guide does not recommend itself as further reading", () => {
  const links = getBlogProductLinks(officeGuide.slug, catalog, [officeGuide]);
  assert.equal(links.guide, null);
  assert.ok(links.products.some(({ id }) => id === "app-office"));
});

test("the async loader provides current product links and published guide data", async () => {
  let calls = 0;
  const links = await loadBlogProductLinks(officeTutorialSlugs[0], async () => {
    calls += 1;
    return { products: [{ id: "app-office", title: "Office terbaru dari katalog" }] };
  }, [officeGuide]);

  assert.equal(calls, 1);
  assert.deepEqual(links.products, [{
    id: "app-office",
    title: "Office terbaru dari katalog",
    href: "/produk/app-office"
  }]);
  assert.deepEqual(links.guide, { title: officeGuide.title, href: `/blog/${officeGuide.slug}` });
});

test("unknown articles do not trigger an unnecessary catalog request", async () => {
  let calls = 0;
  const loadStorefront = async () => {
    calls += 1;
    return { products: catalog };
  };

  for (const slug of ["artikel-baru", "constructor", "__proto__", ""]) {
    assert.equal(await loadBlogProductLinks(slug, loadStorefront, [officeGuide]), null);
  }
  assert.equal(calls, 0);
});

test("a catalog outage omits the optional links without rejecting article rendering", async () => {
  const links = await loadBlogProductLinks(officeTutorialSlugs[0], async () => {
    throw new Error("Catalog temporarily unavailable");
  }, [officeGuide]);

  assert.equal(links, null);
});
