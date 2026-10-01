"use client";

import { useEffect, useId, useRef, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CHAT_INPUT_LIMIT, chatRequestMessages, findChatFaq } from "../lib/chat-client.mjs";

export default function ChatWidget({ open, setOpen, faqItems, whatsapp }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([{ from: "bot", text: "Halo! Saya asisten AI CS Aplikasi.id. Ada yang bisa saya bantu?" }]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const suggestionsId = useId();
  const launcher = useRef(null);
  const history = useRef([]);
  const inFlight = useRef(null);
  const messageList = useRef(null);

  useEffect(() => () => inFlight.current?.abort(), []);
  useEffect(() => {
    const list = messageList.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages, pending, open]);

  function remember(text, reply) {
    history.current = [...chatRequestMessages(history.current, text), { role: "assistant", content: reply.slice(0, CHAT_INPUT_LIMIT) }].slice(-18);
  }

  function askFaq(item) {
    if (inFlight.current) return;
    setError("");
    setShowSuggestions(false);
    remember(item.question, item.answer);
    setMessages((current) => [...current, { from: "user", text: item.question }, { from: "bot", text: item.answer }]);
  }

  async function sendMessage(event) {
    event.preventDefault();
    const text = input.trim();
    if (!text || text.length > CHAT_INPUT_LIMIT || inFlight.current) return;
    const controller = new AbortController();
    inFlight.current = controller;
    const timeout = setTimeout(() => controller.abort(), 75000);
    setPending(true);
    setShowSuggestions(false);
    setError("");
    setInput("");
    setMessages((current) => [...current, { from: "user", text }]);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatRequestMessages(history.current, text) }),
        signal: controller.signal,
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || typeof data?.content !== "string" || !data.content.trim()) {
        throw new Error(typeof data?.error === "string" ? data.error : "AI belum dapat merespons. Silakan coba lagi atau pilih pertanyaan populer.");
      }
      remember(text, data.content);
      setMessages((current) => [...current, { from: "bot", text: data.content }]);
    } catch (failure) {
      setError(failure.name === "AbortError" ? "Respons terlalu lama. Silakan coba lagi atau hubungi CS." : failure.message);
      const faq = findChatFaq(faqItems, text);
      if (faq) {
        remember(text, faq.answer);
        setMessages((current) => [...current, { from: "bot", text: `Jawaban dari FAQ: ${faq.answer}` }]);
      } else {
        // Keep the question ready to retry, without overwriting a new draft.
        setInput((current) => current || text);
      }
    } finally {
      clearTimeout(timeout);
      inFlight.current = null;
      setPending(false);
    }
  }

  function closeChat() {
    setOpen(false);
    requestAnimationFrame(() => launcher.current?.focus());
  }

  const suggestionLabels = { order: "Cara beli", warranty: "Garansi", payment: "Pembayaran" };

  return <div className={`chat-widget${open ? " is-open" : ""}`}>
    <button ref={launcher} hidden={open} className="chat-launcher" type="button" onClick={() => setOpen(true)} aria-expanded={open} aria-label="Buka chat CS">
      ✦<span className="chat-launcher-label">Chat CS</span>
    </button>
    {open && <section className="chat-panel" aria-label="Chat CS Aplikasi.id" onKeyDown={(event) => { if (event.key === "Escape") closeChat(); }}>
      <header className="chat-panel-header"><div><strong>CS Aplikasi.id</strong><small>Asisten AI · Siap membantu</small></div><button className="chat-close" type="button" onClick={closeChat} aria-label="Tutup chat CS">×</button></header>
      <div className="chat-messages" ref={messageList} role="log" aria-live="polite" aria-label="Percakapan CS" aria-busy={pending}>
        {messages.map((message, index) => <div className={`chat-message ${message.from}`} key={index}>
          {message.from === "bot" ? <div className="chat-markdown"><Markdown remarkPlugins={[remarkGfm]} skipHtml disallowedElements={["img"]}>{message.text}</Markdown></div> : message.text}
        </div>)}
        {pending && <p className="chat-message bot" role="status">Sedang menyiapkan jawaban…</p>}
      </div>
      {error && <p className="chat-error" role="alert">{error}</p>}
      {faqItems.length > 0 && <div id={suggestionsId} className="chat-quick-actions" hidden={!showSuggestions} aria-label="Pertanyaan umum">{faqItems.slice(0, 3).map((item) => <button type="button" key={item.id} title={item.question} disabled={pending} onClick={() => askFaq(item)}>{suggestionLabels[item.id] || item.question}</button>)}</div>}
      <form className="chat-composer" onSubmit={sendMessage}>
        <input value={input} maxLength={CHAT_INPUT_LIMIT} onChange={(event) => setInput(event.target.value)} placeholder="Tulis pertanyaanmu..." aria-label="Tulis pesan ke CS" />
        <button type="submit" disabled={pending || !input.trim()} aria-label="Kirim pesan">→</button>
      </form>
      <div className="chat-footer-actions">
        {faqItems.length > 0 && <button className="chat-suggestions-toggle" type="button" aria-expanded={showSuggestions} aria-controls={suggestionsId} onClick={() => setShowSuggestions((current) => !current)}>Pertanyaan umum <span aria-hidden="true">{showSuggestions ? "−" : "+"}</span></button>}
        {whatsapp && <a className="chat-whatsapp" href={whatsapp} target="_blank" rel="noreferrer">CS WhatsApp <span aria-hidden="true">↗</span></a>}
      </div>
    </section>}
  </div>;
}
