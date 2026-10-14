import { createOpenAI } from "@ai-sdk/openai";
import { APICallError, streamText, type ModelMessage } from "ai";
import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "./run-id.server";

export const AI_MODEL = "openai/gpt-6-astra";
const BASE_URL = "https://ai.gateway.lovable.dev/v1";

const OPENAI_OPTIONS = {
  openai: {
    store: false,
    forceReasoning: true,
    reasoningEffort: "low",
    reasoningSummary: "auto",
    include: ["reasoning.encrypted_content"],
  },
} as const;

export class AiConfigError extends Error {}

function provider(initialRunId?: string) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new AiConfigError("AI is not configured yet. Please add an AI key to the backend.");
  const runIdFetch = createLovableAiGatewayRunIdFetch(initialRunId);
  const p = createOpenAI({
    baseURL: BASE_URL,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });
  return { p, runIdFetch };
}

export function friendlyAiError(error: unknown): string {
  if (error instanceof AiConfigError) return error.message;
  const status = APICallError.isInstance(error) ? error.statusCode : undefined;
  if (status === 429) return "The AI service is busy right now. Please wait a moment and try again.";
  if (status === 402) return "AI credits have run out for this workspace. Add credits to continue generating.";
  if (status === 403) return "AI access is currently blocked for this workspace.";
  if (status === 401) return "AI is not configured correctly.";
  console.error("AI error", error);
  return "Something went wrong while generating. Please try again.";
}

/** One-shot generation: streams upstream, returns the final text. */
export async function generate(instructions: string, prompt: string): Promise<string> {
  const { p } = provider();
  const result = streamText({
    model: p.responses(AI_MODEL),
    instructions,
    prompt,
    providerOptions: OPENAI_OPTIONS,
  });
  return await result.text;
}

export async function streamChat(request: Request, instructions: string, messages: ModelMessage[]) {
  const { p, runIdFetch } = provider(getLovableAiGatewayRunId(request));
  const result = streamText({
    model: p.responses(AI_MODEL),
    instructions,
    messages,
    abortSignal: request.signal,
    providerOptions: OPENAI_OPTIONS,
  });
  return withLovableAiGatewayRunIdHeader(
    result.toUIMessageStreamResponse({ onError: friendlyAiError }),
    runIdFetch,
  );
}
