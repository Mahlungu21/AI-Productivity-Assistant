import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Eraser, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/ws/AppShell";
import { Field, OutputPanel, Panel } from "@/components/ws/Output";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAi } from "@/hooks/use-ai";
import { actions } from "@/lib/store";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/email")({
  head: () => seo("Smart Email Generator", "Generate professional emails in the right tone from your key points."),
  component: EmailPage,
});

const initial = { purpose: "", recipient: "colleague", subject: "", points: "", tone: "formal", length: "medium", context: "" };

function EmailPage() {
  const [f, setF] = useState(initial);
  const ai = useAi();
  const up = (k: keyof typeof initial) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  async function generate(override?: Partial<typeof initial>) {
    const data = { ...f, ...override };
    if (!data.purpose.trim() || !data.points.trim()) {
      toast.error("Please add the email purpose and key points.");
      return;
    }
    const t = await ai.run("email", data);
    if (t) actions.recordGeneration("email", `Email: ${data.subject || data.purpose}`);
  }

  return (
    <AppShell>
      <PageHeader icon={Mail} title="Smart Email Generator" description="Describe what you need to say. WorkSmart writes a complete email using only the facts you provide." />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <Panel>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); generate(); }}>
            <Field label="Email purpose" htmlFor="purpose" required>
              <Input id="purpose" value={f.purpose} onChange={up("purpose")} placeholder="e.g. Request a project status update" maxLength={300} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Recipient" htmlFor="recipient">
                <Select value={f.recipient} onValueChange={(v) => setF({ ...f, recipient: v })}>
                  <SelectTrigger id="recipient"><SelectValue /></SelectTrigger>
                  <SelectContent>{["client", "manager", "colleague", "team", "recruiter", "other"].map((r) => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Subject / topic" htmlFor="subject">
                <Input id="subject" value={f.subject} onChange={up("subject")} placeholder="Q3 report" maxLength={200} />
              </Field>
            </div>
            <Field label="Key points" htmlFor="points" required hint="One point per line works best.">
              <Textarea id="points" rows={5} value={f.points} onChange={up("points")} placeholder={"- Report due Friday\n- Need sales figures from Thabo"} maxLength={4000} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Tone" htmlFor="tone">
                <Select value={f.tone} onValueChange={(v) => setF({ ...f, tone: v })}>
                  <SelectTrigger id="tone"><SelectValue /></SelectTrigger>
                  <SelectContent>{["formal", "friendly", "persuasive", "concise"].map((r) => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Length" htmlFor="length">
                <Select value={f.length} onValueChange={(v) => setF({ ...f, length: v })}>
                  <SelectTrigger id="length"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short (~80 words)</SelectItem>
                    <SelectItem value="medium">Medium (~150 words)</SelectItem>
                    <SelectItem value="long">Long (~250 words)</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="Additional context" htmlFor="context">
              <Textarea id="context" rows={2} value={f.context} onChange={up("context")} placeholder="Optional background" maxLength={2000} />
            </Field>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button type="submit" disabled={ai.loading}><Wand2 /> {ai.loading ? "Generating…" : "Generate email"}</Button>
              <Button type="button" variant="ghost" onClick={() => { setF(initial); ai.reset(); }}><Eraser /> Clear</Button>
            </div>
            {ai.text && (
              <div className="flex flex-wrap items-center gap-2 border-t pt-4 text-sm">
                <span className="text-muted-foreground">Change tone:</span>
                {["formal", "friendly", "persuasive", "concise"].filter((t) => t !== f.tone).map((t) => (
                  <Button key={t} type="button" size="sm" variant="soft" className="capitalize" disabled={ai.loading} onClick={() => { setF({ ...f, tone: t }); generate({ tone: t }); }}>{t}</Button>
                ))}
              </div>
            )}
          </form>
        </Panel>
        <OutputPanel text={ai.text} loading={ai.loading} error={ai.error} saveType="email" saveTitle={f.subject || f.purpose} onRegenerate={() => generate()} emptyHint="Your generated email will appear here." />
      </div>
    </AppShell>
  );
}
