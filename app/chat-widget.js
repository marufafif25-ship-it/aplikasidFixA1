"use client";

import { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CHAT_INPUT_LIMIT, chatRequestMessages, findChatFaq } from "../lib/chat-client.mjs";

export default function ChatWidget({ open, setOpen, faqItems, whatsapp }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([{ from: "bot", text: "Halo! Saya asisten AI CS Aplikasi.id. Ada yang bisa saya bantu?" }]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
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

  return <div className={`chat-widget${open ? " is-open" : ""}`}>
    <button className="chat-launcher" type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? "Tutup chat CS" : "Buka chat CS"}>
      {open ? "×" : "✦"}<span className="chat-launcher-label">{open ? "Tutup" : "Chat CS"}</span>
    </button>
    {open && <section className="chat-panel" aria-label="Chat CS Aplikasi.id">
      <header className="chat-panel-header"><div><strong>CS Aplikasi.id</strong><small>Asisten AI · Jawaban otomatis & bantuan FAQ</small></div><span className="chat-online-dot" /></header>
      <div className="chat-messages" ref={messageList} role="log" aria-live="polite" aria-label="Percakapan CS" aria-busy={pending}>
        {messages.map((message, index) => <div className={`chat-message ${message.from}`} key={index}>
          {message.from === "bot" ? <div className="chat-markdown"><Markdown remarkPlugins={[remarkGfm]} skipHtml disallowedElements={["img"]}>{message.text}</Markdown></div> : message.text}
        </div>)}
        {pending && <p className="chat-message bot" role="status">Sedang menyiapkan jawaban…</p>}
      </div>
      {error && <p className="chat-error" role="alert">{error}</p>}
      <div className="chat-quick-title">Pertanyaan populer</div>
      <div className="chat-quick-actions">{faqItems.slice(0, 6).map((item) => <button type="button" key={item.id} disabled={pending} onClick={() => askFaq(item)}>{item.question}</button>)}</div>
      <form className="chat-composer" onSubmit={sendMessage}>
        <input value={input} maxLength={CHAT_INPUT_LIMIT} onChange={(event) => setInput(event.target.value)} placeholder="Tulis pertanyaanmu..." aria-label="Tulis pesan ke CS" />
        <button type="submit" disabled={pending || !input.trim()} aria-label="Kirim pesan">→</button>
      </form>
      {whatsapp && <a className="chat-whatsapp" href={whatsapp} target="_blank" rel="noreferrer">Hubungi CS via WhatsApp <span>↗</span></a>}
    </section>}
  </div>;
}
