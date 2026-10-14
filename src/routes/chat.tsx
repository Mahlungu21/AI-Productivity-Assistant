import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowUp, Copy, Loader2, MessagesSquare, Square, Trash2 } from "lucide-react";
import { AppShell, PageHeader } from "@/components/ws/AppShell";
import { AiDisclaimer, copyText } from "@/components/ws/Output";
import { LogoMark } from "@/components/ws/Logo";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { actions } from "@/lib/store";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/chat")({
  head: () => seo("WorkSmart Assistant", "Chat with an AI workplace assistant for writing, planning and career help."),
  component: ChatPage,
});

const CHIPS = [
  "Help me write a polite follow-up email",
  "How do I prioritise 5 urgent tasks?",
  "Explain agile methodology simply",
  "Improve this sentence: I done the report fast",
  "How do I prepare for a graduate interview?",
  "Which tool should I use to summarise meeting notes?",
];

function ChatPage() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, error, stop, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    onFinish: () => actions.recordGeneration("chat", "Chat with WorkSmart Assistant"),
  });
  const busy = status === "submitted" || status === "streaming";
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => end.current?.scrollIntoView({ behavior: "smooth", block: "end" }), [messages]);

  function send(text: string) {
    const t = text.trim();
    if (!t || busy) return;
    sendMessage({ text: t });
    setInput("");
  }

  return (
    <AppShell>
      <PageHeader icon={MessagesSquare} title="WorkSmart Assistant" description="Ask for help with writing, planning, research or your career. It can point you to the right tool."
        actions={messages.length > 0 && <Button variant="outline" onClick={() => setMessages([])} disabled={busy}><Trash2 /> Clear conversation</Button>} />

      <div className="flex h-[calc(100vh-15rem)] min-h-[480px] flex-col rounded-2xl border bg-card shadow-card">
        <div className="flex-1 space-y-6 overflow-y-auto p-5 sm:p-6">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <LogoMark className="size-12" />
              <h2 className="mt-4 text-2xl font-semibold text-primary">How can I help today?</h2>
              <div className="mt-6 flex max-w-2xl flex-wrap justify-center gap-2">
                {CHIPS.map((c) => <Button key={c} variant="soft" size="sm" className="rounded-full" onClick={() => send(c)}>{c}</Button>)}
              </div>
            </div>
          )}
          {messages.map((m) => {
            const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
            if (m.role === "user")
              return <div key={m.id} className="ml-auto max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">{text}</div>;
            return (
              <div key={m.id} className="flex gap-3">
                <LogoMark className="size-7 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="prose-ws">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                      a: ({ href, children }) => href?.startsWith("/")
                        ? <a href={href} onClick={(e) => { e.preventDefault(); navigate({ to: href }); }} className="font-semibold text-magenta underline">{children}</a>
                        : <a href={href} target="_blank" rel="noreferrer" className="text-magenta underline">{children}</a>,
                    }}>{text}</ReactMarkdown>
                  </div>
                  {text && status !== "streaming" && (
                    <Button size="sm" variant="ghost" className="mt-1 h-7 px-2 text-xs text-muted-foreground" onClick={() => copyText(text)}><Copy className="!size-3" /> Copy</Button>
                  )}
                </div>
              </div>
            );
          })}
          {status === "submitted" && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin text-magenta" /> Thinking…</div>}
          {error && <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error.message || "Something went wrong. Please try again."}</div>}
          <div ref={end} />
        </div>
        <div className="border-t p-3 sm:p-4">
          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-end gap-2 rounded-xl border bg-background p-2 focus-within:ring-2 focus-within:ring-ring">
            <Textarea value={input} onChange={(e) => setInput(e.target.value)} rows={1} maxLength={6000}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
              placeholder="Message WorkSmart Assistant…" aria-label="Message" className="max-h-40 min-h-10 resize-none border-0 shadow-none focus-visible:ring-0" />
            {busy ? (
              <Button type="button" size="icon" variant="outline" onClick={() => stop()} aria-label="Stop"><Square /></Button>
            ) : (
              <Button type="submit" size="icon" disabled={!input.trim()} aria-label="Send"><ArrowUp /></Button>
            )}
          </form>
          <div className="mt-2"><AiDisclaimer>AI can be wrong. Don't share confidential information. Verify important answers.</AiDisclaimer></div>
        </div>
      </div>
    </AppShell>
  );
}
