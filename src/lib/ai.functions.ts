import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const FEATURES = [
  "email",
  "meeting",
  "planner",
  "research",
  "resume-summary",
  "resume-experience",
  "resume-keywords",
] as const;

const inputSchema = z.object({
  feature: z.enum(FEATURES),
  data: z.record(z.string().max(30000)),
});

export type AiFeature = (typeof FEATURES)[number];
export type AiResult = { ok: true; text: string } | { ok: false; error: string };

export const runAi = createServerFn({ method: "POST" })
  .inputValidator((input: z.infer<typeof inputSchema>) => inputSchema.parse(input))
  .handler(async ({ data }): Promise<AiResult> => {
    const { buildPrompt } = await import("./ai/prompts.server");
    const { generate, friendlyAiError } = await import("./ai/gateway.server");
    try {
      const { system, prompt } = buildPrompt(data.feature, data.data);
      const text = (await generate(system, prompt)).trim();
      if (!text) return { ok: false, error: "The AI returned an empty response. Please try again." };
      return { ok: true, text };
    } catch (e) {
      return { ok: false, error: friendlyAiError(e) };
    }
  });
