import { CHAT_LIMIT_MESSAGE, hasReachedChatLimit } from "./chat-limits.mjs";

export const CHAT_INPUT_LIMIT = 4000;

// Retain complete turns so the API always receives user/assistant pairs,
// followed by the new user message. Greetings and errors are excluded.
export function chatRequestMessages(history, text) {
  if (hasReachedChatLimit(history)) throw new Error(CHAT_LIMIT_MESSAGE);
  return [...history, { role: "user", content: text.trim() }]
    .map(({ role, content }) => ({ role, content: content.slice(0, CHAT_INPUT_LIMIT) }));
}

export function findChatFaq(items, text) {
  const normalized = text.trim().toLowerCase();
  return items.find((item) => item.active !== false && (
    item.question.toLowerCase() === normalized ||
    String(item.keywords || "").toLowerCase().split(",").some((word) => word.trim() && normalized.includes(word.trim()))
  ));
}
