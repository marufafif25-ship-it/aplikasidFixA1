const stopWords = new Set("cara membuat menggunakan mengatur memilih menyiapkan merapikan membaca mengelola mendapatkan sebelum setelah dengan untuk yang dan atau agar dari pada dalam tanpa bisa setiap pertama sederhana tepat tentang panduan tips software aplikasi produk versi file kerja kuliah skripsi resmi gratis pro sd".split(" "));
const softwareNames = new Set("office word excel powerpoint onenote premiere aftereffects davinci photoshop lightroom coreldraw illustrator autocad sketchup spss stata eviews smartpls mendeley zotero acrobat nitro".split(" "));
const topicPatterns = [
  /\b(?:office|word|excel|powerpoint|onenote|spreadsheet|pivottable)\b/,
  /\b(?:video|animasi|premiere|aftereffects|davinci)\b/,
  /\b(?:desain|fotografi|photoshop|lightroom|coreldraw|illustrator)\b/,
  /\b(?:engineering|cad|autocad|sketchup|3d)\b/,
  /\b(?:statistik|kuesioner|spss|stata|eviews|smartpls)\b/,
  /\b(?:referensi|sitasi|mendeley|zotero)\b/,
  /\b(?:pdf|ocr|acrobat|nitro)\b/,
  /\b(?:kolaborasi|google drive)\b/
];
const genericCategories = new Set(["", "tips", "tips software", "umum", "software"]);
const text = (value) => typeof value === "string" ? value : "";
const normalize = (value) => text(value).toLowerCase().replace(/[-_]/g, " ")
  .replace(/\bafter\s+effects\b/g, "aftereffects").replace(/\bda\s+vinci\b/g, "davinci").replace(/\s+/g, " ").trim();

function describe(post) {
  const title = normalize(`${text(post.title)} ${text(post.slug)}`);
  const words = new Set((title.match(/[\p{L}\p{N}]+/gu) || [])
    .filter((word) => word.length > 2 && !stopWords.has(word) && !/^\d+$/.test(word)));
  const category = normalize(post.category);
  return {
    words,
    software: new Set([...words].filter((word) => softwareNames.has(word))),
    topics: new Set(topicPatterns.flatMap((pattern, index) => pattern.test(`${title} ${category}`) ? [index] : [])),
    category: genericCategories.has(category) ? "" : category
  };
}

const sharedCount = (a, b) => [...a].filter((value) => b.has(value)).length;

export function getRelatedBlogPosts(post, posts = [], limit = 3) {
  if (!post?.slug || !Array.isArray(posts) || !Number.isInteger(limit) || limit <= 0) return [];
  const source = describe(post);
  const seen = new Set([post.slug]);
  return posts.flatMap((candidate) => {
    if (!candidate || candidate.published !== true || !text(candidate.title).trim()
      || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(text(candidate.slug)) || seen.has(candidate.slug)) return [];
    seen.add(candidate.slug);
    const target = describe(candidate);
    const software = sharedCount(source.software, target.software);
    const topics = sharedCount(source.topics, target.topics);
    const category = source.category && source.category === target.category ? 1 : 0;
    const words = sharedCount(source.words, target.words);
    // Common words alone need at least two matches; generic labels do not
    // make unrelated articles relevant. Exact software takes precedence.
    if (!software && !topics && !category && words < 2) return [];
    return [{ post: candidate, score: software * 100 + topics * 10 + category * 5 + Math.min(words, 4) }];
  }).sort((a, b) => b.score - a.score
    || (Date.parse(b.post.publishedAt) || 0) - (Date.parse(a.post.publishedAt) || 0)
    || a.post.slug.localeCompare(b.post.slug, "id"))
    .slice(0, Math.min(limit, 3)).map((item) => item.post);
}
