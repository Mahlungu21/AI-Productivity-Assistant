import { useEffect, useState, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy, Pencil, RefreshCw, Save, Eye, AlertTriangle, Loader2, Sparkle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { actions, type SavedType } from "@/lib/store";
import { cn } from "@/lib/utils";

export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div className={cn("prose-ws", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}

export function AiDisclaimer({ children }: { children?: ReactNode }) {
  return (
    <p className="flex items-start gap-2 rounded-lg bg-blush px-3 py-2 text-xs text-secondary-foreground">
      <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-magenta" />
      <span>{children ?? "AI-generated content can contain errors. Review and verify before using it."}</span>
    </p>
  );
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  } catch {
    toast.error("Couldn't copy — please select and copy manually.");
  }
}

type Props = {
  text: string | null;
  loading: boolean;
  error: string | null;
  saveType: SavedType;
  saveTitle: string;
  onRegenerate?: () => void;
  emptyHint: string;
  extraActions?: ReactNode;
};

export function OutputPanel({ text, loading, error, saveType, saveTitle, onRegenerate, emptyHint, extraActions }: Props) {
  const [draft, setDraft] = useState(text ?? "");
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    setDraft(text ?? "");
    setEditing(false);
    setSaved(false);
  }, [text]);

  return (
    <section className="flex min-h-[420px] flex-col rounded-2xl border bg-card shadow-card" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-5 py-3">
        <h2 className="font-display text-lg font-semibold text-primary">Result</h2>
        {text && !loading && (
          <div className="flex flex-wrap gap-1.5">
            {onRegenerate && (
              <Button size="sm" variant="ghost" onClick={onRegenerate}><RefreshCw /> Regenerate</Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => setEditing((e) => !e)}>
              {editing ? <><Eye /> Preview</> : <><Pencil /> Edit</>}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => copyText(draft)}><Copy /> Copy</Button>
            <Button
              size="sm"
              variant="magenta"
              disabled={saved}
              onClick={() => {
                actions.save({ type: saveType, title: saveTitle || "Untitled", content: draft });
                setSaved(true);
                toast.success("Saved to My Saved Work");
              }}
            >
              {saved ? <><Check /> Saved</> : <><Save /> Save</>}
            </Button>
            {extraActions}
          </div>
        )}
      </div>
      <div className="flex-1 p-5">
        {loading ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
            <Loader2 className="size-7 animate-spin text-magenta" />
            <p className="text-sm">Generating a thoughtful result…</p>
          </div>
        ) : error ? (
          <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            <p className="font-semibold">We couldn't generate this.</p>
            <p className="mt-1">{error}</p>
            {onRegenerate && <Button size="sm" variant="outline" className="mt-3" onClick={onRegenerate}>Try again</Button>}
          </div>
        ) : text ? (
          editing ? (
            <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} className="min-h-[360px] font-mono text-sm" aria-label="Edit result" />
          ) : (
            <Markdown>{draft}</Markdown>
          )
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-blush text-magenta"><Sparkle className="size-5" /></div>
            <p className="max-w-xs text-sm text-muted-foreground">{emptyHint}</p>
          </div>
        )}
      </div>
      {text && !loading && <div className="px-5 pb-5"><AiDisclaimer /></div>}
    </section>
  );
}

export function Field({ label, htmlFor, hint, children, required }: { label: string; htmlFor: string; hint?: string; children: ReactNode; required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-foreground">
        {label} {required && <span className="text-magenta" aria-hidden>*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("rounded-2xl border bg-card p-5 shadow-card sm:p-6", className)}>{children}</section>;
}
