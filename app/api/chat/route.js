import { createChatHandler, chatConfig } from "../../../lib/chat.mjs";
import { getStorefront } from "../../../lib/storefront-server";
import { guides } from "../../../lib/guides";

export const runtime = "nodejs";
export const maxDuration = 90;

export const POST = createChatHandler({
  loadContext: async () => ({ store: await getStorefront(), guides }),
  getConfig: () => chatConfig(process.env),
});
