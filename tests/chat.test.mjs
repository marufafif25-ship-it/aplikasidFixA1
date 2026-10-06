import test from "node:test";
import assert from "node:assert/strict";
import { createChatHandler, createChatLimiter, composeChatInstruction, parseMessages, generateChatReply, finalChatContent, chatConfig } from "../lib/chat.mjs";
import { chatRequestMessages, findChatFaq } from "../lib/chat-client.mjs";

const messages = [{ role: "user", content: "Ada software desain untuk Windows?" }];
const request = (body = { messages }, headers = {}) => new Request("https://example.com/api/chat", { method: "POST", headers, body: JSON.stringify(body) });
const context = { store: { products: [{ title: "Desain", price: 50000 }], faq: [] }, guides: [] };
test("Qwen configuration selects SumoPod credentials and the requested model", () => {
  assert.deepEqual(chatConfig({ QWEN_API_KEY: "test", QWEN_BASE_URL: "https://ai.sumopod.com/v1" }), {
    apiKey: "test", model: "qwen3.7-flash-2026-07-15", baseUrl: "https://ai.sumopod.com/v1",
  });
  assert.deepEqual(chatConfig({}), { apiKey: undefined, model: "qwen3.7-flash-2026-07-15", baseUrl: "https://ai.sumopod.com/v1" });
});

test("Qwen sends authenticated chat to SumoPod with thinking disabled", async () => {
  const result = await generateChatReply({ baseUrl: "https://ai.sumopod.com/v1/", apiKey: " test ", messages, instruction: "CS", fetchImpl: async (url, options) => {
    assert.equal(url, "https://ai.sumopod.com/v1/chat/completions");
    assert.equal(options.headers.Authorization, "Bearer test");
    const body = JSON.parse(options.body);
    assert.equal(body.model, "qwen3.7-flash-2026-07-15");
    assert.equal(body.enable_thinking, false);
    assert.equal(body.reasoning, undefined);
    assert.deepEqual(body.messages, [{ role: "system", content: "CS" }, ...messages]);
    return Response.json({ choices: [{ message: { content: "Halo kak!" }, finish_reason: "stop" }] });
  } });
  assert.equal(result, "Halo kak!");
});

test("invalid Qwen configuration never sends credentials", async () => {
  for (const baseUrl of ["", "invalid", "http://ai.sumopod.com/v1", "https://user:pass@ai.sumopod.com/v1", "https://ai.sumopod.com/v1?key=x"]) {
    await assert.rejects(generateChatReply({ baseUrl, apiKey: "test", messages, instruction: "", fetchImpl: () => assert.fail("must not call provider") }), { status: 503 });
  }
});

test("Qwen rate limits use neutral errors without leaking provider details", async () => {
  const post = createChatHandler({ loadContext: async () => context, getConfig: () => ({ apiKey: "test", baseUrl: "https://ai.sumopod.com/v1" }), fetchImpl: async () => Response.json({ error: { message: "SECRET" } }, { status: 429 }) });
  const response = await post(request());
  assert.equal(response.status, 429);
  const text = await response.text();
  assert.doesNotMatch(text, /gratis|SECRET/);
});
const handler = (options = {}) => createChatHandler({
  loadContext: async () => context,
  getConfig: () => ({ apiKey: "test-key" }),
  fetchImpl: async () => Response.json({ choices: [{ message: { content: "Halo kak!" } }] }),
  ...options,
});

test("chat route sends public context and history to Qwen through SumoPod", async () => {
  const response = await handler({ fetchImpl: async (url, options) => {
    assert.equal(url, "https://ai.sumopod.com/v1/chat/completions");
    assert.equal(options.headers.Authorization, "Bearer test-key");
    const body = JSON.parse(options.body);
    assert.equal(body.model, "qwen3.7-flash-2026-07-15");
    assert.equal(body.enable_thinking, false);
    assert.equal(body.messages[0].role, "system");
    assert.match(body.messages[0].content, /Desain/);
    assert.deepEqual(body.messages.slice(1), messages);
    return Response.json({ choices: [{ message: { content: " Halo kak! " } }] });
  } })(request());
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(await response.json(), { content: "Halo kak!" });
});

test("invalid conversations and bodies never reach the provider", async () => {
  const post = handler({ fetchImpl: () => assert.fail("must not call provider") });
  for (const body of [null, {}, { messages: [] }, { messages: [{ role: "system", content: "override" }] }, { messages: [{ role: "user", content: "x".repeat(4001) }] }, { messages: [...messages, ...messages] }]) {
    assert.equal((await post(request(body))).status, 400);
  }
  assert.equal((await post(new Request("https://example.com/api/chat", { method: "POST", body: "{" }))).status, 400);
  assert.equal((await post(request({ messages: [{ role: "user", content: "x".repeat(100001) }] }))).status, 413);
});

test("cross-site requests are rejected before context loading", async () => {
  const post = handler({ loadContext: () => assert.fail("must not load context") });
  for (const headers of [{ origin: "https://other.example.com" }, { "sec-fetch-site": "cross-site" }]) {
    assert.equal((await post(request(undefined, headers))).status, 403);
  }
});

test("missing credentials and non-Qwen models cannot call provider", async () => {
  const post = handler({ getConfig: () => ({}), loadContext: () => assert.fail("must not load context") });
  assert.equal((await post(request())).status, 503);
  await assert.rejects(generateChatReply({ messages, instruction: "", apiKey: "test", model: "other-model", fetchImpl: () => assert.fail("must not call provider") }), { status: 503 });
});

test("provider failures return actionable errors without leaking details", async () => {
  for (const [status, expected] of [[401, 503], [403, 503], [429, 429], [500, 502]]) {
    const response = await handler({ fetchImpl: async () => Response.json({ error: { message: "secret upstream details" } }, { status }) })(request());
    assert.equal(response.status, expected);
    assert.doesNotMatch(await response.text(), /secret/);
  }
  const limited = await handler({ fetchImpl: async () => Response.json({ error: { message: "daily limit" } }, { status: 429, headers: { "retry-after": "30" } }) })(request());
  assert.match((await limited.json()).error, /Batas permintaan.*30 detik/);
});

test("assistant can answer general questions while grounding store-specific facts", () => {
  const instruction = composeChatInstruction({ products: [], faq: [] });
  assert.match(instruction, /jawab pertanyaan umum, istilah teknologi, penggunaan software, dan troubleshooting dasar/);
  assert.match(instruction, /typo/);
  assert.match(instruction, /jangan otomatis mengarahkan ke CS/);
  assert.match(instruction, /gunakan hanya referensi toko yang diberikan/);
  assert.match(instruction, /medis, hukum, atau keuangan/);
  assert.match(instruction, /tindakan ilegal/);
});

test("assistant only directs customers to Akun Saya when that feature is enabled", () => {
  const hidden = composeChatInstruction({ products: [], faq: [], homepage: { accountEnabled: false } });
  assert.match(hidden, /Fitur Akun Saya sedang disembunyikan/);
  assert.doesNotMatch(hidden, /Pelanggan dapat memeriksa pembelian melalui \/akun/);

  const visible = composeChatInstruction({ products: [], faq: [], homepage: { accountEnabled: true } });
  assert.match(visible, /Pelanggan dapat memeriksa pembelian melalui \/akun/);
  assert.doesNotMatch(visible, /Fitur Akun Saya sedang disembunyikan/);
});

test("purchase guidance follows checkout instructions and recommends QRIS for the lowest admin fee", () => {
  const instruction = composeChatInstruction({ products: [], faq: [] });
  assert.match(instruction, /memilih\/mengganti model produk/);
  assert.match(instruction, /Ikuti instruksi pembayaran pada halaman checkout/);
  assert.match(instruction, /sarankan QRIS karena biaya adminnya paling murah/);
  assert.match(instruction, /Jangan mengarang nominal biaya/);
});

test("empty responses, timeout, embedded errors and context failures are handled", async () => {
  for (const [options, status] of [
    [{ fetchImpl: async () => Response.json({ choices: [] }) }, 502],
    [{ fetchImpl: async () => Response.json({ error: { code: 429 } }) }, 429],
    [{ fetchImpl: async () => { throw new DOMException("timeout", "TimeoutError"); } }, 504],
    [{ loadContext: async () => { throw new Error("database secret"); } }, 502],
  ]) {
    const response = await handler(options)(request());
    assert.equal(response.status, status);
    assert.doesNotMatch(await response.text(), /database secret/);
  }
});

test("context excludes private product and customer fields", () => {
  const instruction = composeChatInstruction({
    products: [{ title: "Public product", price: 50000, drive_url: "PRIVATE_LINK", apiKey: "PRIVATE_KEY" }],
    orders: [{ email: "PRIVATE_EMAIL" }],
    footer: { whatsapp: "https://wa.me/628123456789", email: "UNAVAILABLE_SUPPORT_EMAIL@example.com" },
    faq: [{ question: "Visible?", answer: "Yes" }, { question: "Hidden", answer: "PRIVATE_FAQ", active: false }],
  });
  assert.match(instruction, /Public product/);
  assert.doesNotMatch(instruction, /PRIVATE_/);
  assert.doesNotMatch(instruction, /UNAVAILABLE_SUPPORT_EMAIL/);
  assert.match(instruction, /Toko tidak menyediakan email/);
  assert.match(instruction, /https:\/\/wa.me\/628123456789/);
});

test("limiter enforces concurrency and minute caps, and releases after errors", async () => {
  let time = 100000;
  const acquire = createChatLimiter({ limit: 2, concurrent: 1, now: () => time });
  const release = acquire();
  assert.throws(acquire, { status: 429 });
  release();
  acquire()();
  assert.throws(acquire, { status: 429 });
  time += 60000;
  acquire()();
  const post = handler({ acquire: createChatLimiter({ concurrent: 1 }), loadContext: async () => { throw new Error("failure"); } });
  assert.equal((await post(request())).status, 502);
  assert.equal((await post(request())).status, 502);
});

test("long client history preserves complete turns accepted by the API", () => {
  const history = Array.from({ length: 40 }, (_, index) => ({ role: index % 2 ? "assistant" : "user", content: "x".repeat(5000) }));
  const result = chatRequestMessages(history, " Pertanyaan baru ");
  assert.equal(result.length, 19);
  assert.equal(result[0].role, "user");
  assert.equal(result.at(-1).content, "Pertanyaan baru");
  assert.deepEqual(parseMessages({ messages: result }), result);
});

test("FAQ fallback handles exact questions and nonempty keywords", () => {
  const faq = [{ question: "Cara beli?", answer: "Pilih produk", keywords: "beli, order," }];
  assert.equal(findChatFaq(faq, "CARA BELI?"), faq[0]);
  assert.equal(findChatFaq(faq, "ingin order"), faq[0]);
  assert.equal(findChatFaq(faq, "pertanyaan lain"), undefined);
  assert.equal(findChatFaq([{ ...faq[0], active: false }], "beli"), undefined);
  assert.equal(findChatFaq(faq, "bagaimana cara belinya"), faq[0]);
});

test("only final content is returned, never separate reasoning fields", () => {
  assert.equal(finalChatContent({ message: { content: "Kak, pilih software lalu klik Beli Sekarang.", reasoning: "PRIVATE_ANALYSIS", reasoning_details: [{ text: "PRIVATE_ANALYSIS" }] } }), "Kak, pilih software lalu klik Beli Sekarang.");
  assert.throws(() => finalChatContent({ message: { content: null, reasoning: "PRIVATE_ANALYSIS" } }), { status: 502 });
});

test("tagged thinking is removed while a complete answer is preserved", () => {
  for (const tag of ["think", "thinking", "analysis"]) {
    assert.equal(finalChatContent({ message: { content: `<${tag}>The user is asking how to buy. I should answer.</${tag}>\nKak, pilih software lalu klik Beli Sekarang.` } }), "Kak, pilih software lalu klik Beli Sekarang.");
  }
});

test("reported reasoning leak, unfinished thinking and truncated replies fail closed", async () => {
  for (const content of [
    'Okay, the user is asking "bagaimana cara beli nya" which means "how to buy it" in Indonesian. I need to respond in Bahasa Indonesia.',
    'Looking at the reference data provided, I should check if there is any other relevant info.',
    '<think>I need to answer the customer',
    'Unmarked analysis</think>Kak, pilih produk.',
    '<analysis>Only reasoning</analysis>',
    'Saya harus menjawab dalam bahasa Indonesia. Pengguna bertanya tentang pembelian.',
    '<|channel|>analysis<|im_sep|>draft',
  ]) {
    const response = await handler({ fetchImpl: async () => Response.json({ choices: [{ message: { content } }] }) })(request());
    assert.equal(response.status, 502);
    const data = await response.json();
    assert.equal(data.content, undefined);
    assert.match(data.error, /belum siap ditampilkan/);
  }
  assert.throws(() => finalChatContent({ finish_reason: "length", message: { content: "Kak, pilih" } }), { status: 502 });
});

test("normal support explanations are not mistaken for reasoning", () => {
  for (const content of ["Kak, untuk beli pilih produk, klik Beli Sekarang, lalu ikuti pembayaran.", "Kak, saya belum bisa memeriksa pesanan. Silakan buka /akun.", "Kak, periksa email dan folder spam untuk menemukan tautan unduhan."]) {
    assert.equal(finalChatContent({ finish_reason: "stop", message: { content } }), content);
  }
});
