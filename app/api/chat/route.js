import { createChatHandler, DEFAULT_CHAT_MODEL } from "../../../lib/chat.mjs";
import { getStorefront } from "../../../lib/storefront-server";
import { guides } from "../../../lib/guides";

export const runtime = "nodejs";
export const maxDuration = 90;

export const POST = createChatHandler({
  loadContext: async () => ({ store: await getStorefront(), guides }),
  getConfig: () => ({ apiKey: process.env.OPENROUTER_API_KEY, model: process.env.OPENROUTER_MODEL?.trim() || DEFAULT_CHAT_MODEL }),
});
