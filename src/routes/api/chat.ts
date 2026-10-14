import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, type UIMessage } from "ai";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { CHAT_SYSTEM } = await import("@/lib/ai/prompts.server");
        const { streamChat, friendlyAiError } = await import("@/lib/ai/gateway.server");
        let body: { messages?: UIMessage[] };
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid request" }, { status: 400 });
        }
        const messages = Array.isArray(body.messages) ? body.messages.slice(-30) : [];
        if (messages.length === 0) return Response.json({ error: "No messages" }, { status: 400 });
        try {
          return await streamChat(request, CHAT_SYSTEM, await convertToModelMessages(messages));
        } catch (e) {
          return Response.json({ error: friendlyAiError(e) }, { status: 500 });
        }
      },
    },
  },
});
