export const MAX_CHAT_TURNS = 10;
export const MAX_CHAT_MESSAGES = MAX_CHAT_TURNS * 2 - 1;
export const CHAT_LIMIT_MESSAGE = `Batas ${MAX_CHAT_TURNS} pesan untuk percakapan ini sudah tercapai. Silakan lanjutkan melalui CS WhatsApp.`;

export function hasReachedChatLimit(history) {
  return history.filter((message) => message.role === "user").length >= MAX_CHAT_TURNS;
}
