import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Microscope, Eraser, Wand2, Info } from "lucide-react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/ws/AppShell";
import { Field, OutputPanel, Panel } from "@/components/ws/Output";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAi } from "@/hooks/use-ai";
import { actions } from "@/lib/store";
import { seo } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/research")({
  head: () => seo("AI Research Assistant", "Simplify articles, reports and complex topics into clear findings."),
  component: ResearchPage,
});

const MODES = ["Short summary", "Detailed summary", "Beginner-friendly explanation", "Professional report format", "Bullet-point summary"];

function ResearchPage() {
  const [input, setInput] = useState("");
  const [instructions, setInstructions] = useState("");
  const [mode, setMode] = useState<string>(MODES[0]!);
  const ai = useAi();

  async function generate() {
    if (input.trim().length < 10) {
      toast.error("Enter a research question, topic or paste some text.");
      return;
    }
    const t = await ai.run("research", { input, instructions, mode });
    if (t) actions.recordGeneration("research", `Research: ${input.slice(0, 50)}`);
  }

  return (
    <AppShell>
      <PageHeader icon={Microscope} title="AI Research Assistant" description="Ask a question or paste an article. Findings from your text are kept separate from AI analysis." />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Panel>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); generate(); }}>
            <Field label="Question, topic or text" htmlFor="input" required>
              <Textarea id="input" rows={10} value={input} onChange={(e) => setInput(e.target.value)} placeholder="e.g. Explain how inflation affects small businesses — or paste a report…" maxLength={25000} />
            </Field>
            <fieldset className="space-y-2">
              <legend className="text-sm font-semibold">Output format</legend>
              <div className="flex flex-wrap gap-2">
                {MODES.map((m) => (
                  <button type="button" key={m} onClick={() => setMode(m)} aria-pressed={mode === m}
                    className={cn("rounded-full border px-3 py-1.5 text-xs font-medium transition", mode === m ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-accent")}>
                    {m}
                  </button>
                ))}
              </div>
            </fieldset>
            <Field label="Audience & depth (optional)" htmlFor="instr"><Input id="instr" value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="e.g. For a non-technical manager" maxLength={500} /></Field>
            <p className="flex gap-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground"><Info className="mt-0.5 size-3.5 shrink-0" /> No live web access: answers are based on your text and the AI model's general knowledge. No citations are generated.</p>
            <div className="flex gap-2">
              <Button type="submit" disabled={ai.loading}><Wand2 /> {ai.loading ? "Analysing…" : "Analyse"}</Button>
              <Button type="button" variant="ghost" onClick={() => { setInput(""); setInstructions(""); ai.reset(); }}><Eraser /> Clear</Button>
            </div>
          </form>
        </Panel>
        <OutputPanel text={ai.text} loading={ai.loading} error={ai.error} saveType="research" saveTitle={input.slice(0, 60)} onRegenerate={generate} emptyHint="Summary, key findings, insights and limitations will appear here." />
      </div>
    </AppShell>
  );
}
