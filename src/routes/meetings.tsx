import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { NotebookPen, Eraser, Wand2, FileText } from "lucide-react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/ws/AppShell";
import { Field, OutputPanel, Panel } from "@/components/ws/Output";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAi } from "@/hooks/use-ai";
import { actions } from "@/lib/store";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/meetings")({
  head: () => seo("Meeting Notes Summarizer", "Turn long meeting notes into decisions, action items and follow-ups."),
  component: MeetingsPage,
});

const SAMPLE = {
  title: "Website relaunch sync (sample)",
  participants: "Lerato, Sipho, Anna",
  notes: `Lerato opened, said the design is 80% done. Sipho worried the payment page isn't tested yet.
Agreed to push launch from 1 Nov to 15 Nov.
Anna will write the FAQ copy by 5 Nov.
Sipho to run payment tests - no date given.
Question: do we need a cookie banner for EU visitors? Nobody sure.`,
};

function MeetingsPage() {
  const [f, setF] = useState({ title: "", participants: "", notes: "" });
  const ai = useAi();

  async function generate() {
    if (f.notes.trim().length < 30) {
      toast.error("Please paste at least a few sentences of meeting notes.");
      return;
    }
    const t = await ai.run("meeting", f);
    if (t) actions.recordGeneration("meeting", `Summary: ${f.title || "Meeting"}`);
  }

  return (
    <AppShell>
      <PageHeader icon={NotebookPen} title="Meeting Notes Summarizer" description="Paste raw notes. Get an executive summary, decisions and an action-item table — with nothing invented." />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Panel>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); generate(); }}>
            <Field label="Meeting title" htmlFor="title"><Input id="title" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} maxLength={200} /></Field>
            <Field label="Participants" htmlFor="participants"><Input id="participants" value={f.participants} onChange={(e) => setF({ ...f, participants: e.target.value })} placeholder="Comma-separated" maxLength={500} /></Field>
            <Field label="Meeting notes" htmlFor="notes" required hint={`${f.notes.length.toLocaleString()} / 20,000 characters`}>
              <Textarea id="notes" rows={12} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} placeholder="Paste your notes or transcript here…" maxLength={20000} />
            </Field>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={ai.loading}><Wand2 /> {ai.loading ? "Summarising…" : "Summarise"}</Button>
              <Button type="button" variant="soft" onClick={() => setF(SAMPLE)}><FileText /> Load sample notes</Button>
              <Button type="button" variant="ghost" onClick={() => { setF({ title: "", participants: "", notes: "" }); ai.reset(); }}><Eraser /> Clear</Button>
            </div>
          </form>
        </Panel>
        <OutputPanel text={ai.text} loading={ai.loading} error={ai.error} saveType="meeting" saveTitle={f.title || "Meeting summary"} onRegenerate={generate} emptyHint="Your structured summary and action items will appear here. Missing owners or deadlines are marked “Not specified”." />
      </div>
    </AppShell>
  );
}
