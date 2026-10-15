import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileUser, ArrowLeft, ArrowRight, Wand2, Plus, Trash2, Printer, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/ws/AppShell";
import { AiDisclaimer, Field, Markdown, Panel } from "@/components/ws/Output";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAi } from "@/hooks/use-ai";
import { actions } from "@/lib/store";
import { seo } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/resume")({
  head: () => seo("AI Resume Builder", "Build an honest, ATS-friendly resume step by step with AI wording help."),
  component: ResumePage,
});

type Job = { role: string; company: string; dates: string; text: string; improved: string };
const STEPS = ["Details", "Summary", "Experience", "Skills & education", "Preview", "Template & export"];
const TEMPLATES = ["Classic", "Modern", "ATS plain"] as const;

function ResumePage() {
  const [step, setStep] = useState(0);
  const [p, setP] = useState({ name: "", email: "", phone: "", location: "", title: "", links: "" });
  const [s, setS] = useState({ experience: "", goals: "", target: "", summary: "" });
  const [jobs, setJobs] = useState<Job[]>([{ role: "", company: "", dates: "", text: "", improved: "" }]);
  const [k, setK] = useState({ tech: "", soft: "", education: "", certs: "" });
  const [tpl, setTpl] = useState<(typeof TEMPLATES)[number]>("Classic");
  const [jd, setJd] = useState("");
  const [busyIdx, setBusyIdx] = useState<number | null>(null);
  const summaryAi = useAi();
  const jobAi = useAi();
  const kwAi = useAi();

  const canNext = step !== 0 || (p.name.trim() && p.title.trim());

  async function genSummary() {
    if (!s.experience.trim() && !s.target.trim()) return void toast.error("Describe your experience or target role first.");
    const t = await summaryAi.run("resume-summary", { name: p.name, title: p.title, ...s });
    if (t) setS((x) => ({ ...x, summary: t }));
  }
  async function improveJob(i: number) {
    const j = jobs[i];
    if (!j) return;
    if (!j.text.trim()) return void toast.error("Add responsibilities first.");
    setBusyIdx(i);
    const t = await jobAi.run("resume-experience", { role: j.role, company: j.company, text: j.text, target: s.target });
    setBusyIdx(null);
    if (t) setJobs((js) => js.map((x, n) => (n === i ? { ...x, improved: t } : x)));
  }
  const setJob = (i: number, patch: Partial<Job>) => setJobs((js) => js.map((x, n) => (n === i ? { ...x, ...patch } : x)));

  const md = buildMarkdown();
  function buildMarkdown() {
    const contact = [p.email, p.phone, p.location, p.links].filter(Boolean).join(" · ");
    const lines: (string | false)[] = [`# ${p.name || "Your Name"}`, `**${p.title || "Professional title"}**`, contact, ""];
    if (s.summary) lines.push("## Professional summary", s.summary, "");
    const filled = jobs.filter((j) => j.role || j.company);
    if (filled.length) {
      lines.push("## Work experience");
      filled.forEach((j) => lines.push(`### ${j.role}${j.company ? ` — ${j.company}` : ""}`, j.dates ? `_${j.dates}_` : "", j.improved || j.text, ""));
    }
    if (k.tech || k.soft) lines.push("## Skills", k.tech && `**Technical:** ${k.tech}`, k.soft && `**Soft skills:** ${k.soft}`, "");
    if (k.education) lines.push("## Education", k.education, "");
    if (k.certs) lines.push("## Certifications", k.certs, "");
    return lines.filter((l): l is string => typeof l === "string").join("\n\n").replace(/\n{3,}/g, "\n\n");
  }

  function finish() {
    actions.save({ type: "resume", title: `Resume — ${p.name || "Draft"}`, content: md });
    actions.recordGeneration("resume", `Resume: ${p.name || "Draft"}`);
    toast.success("Resume saved to My Saved Work");
  }

  return (
    <AppShell>
      <PageHeader icon={FileUser} title="AI Resume Builder" description="Six guided steps. AI improves wording but never adds employers, dates or achievements you didn't give it." />

      <ol className="no-print mb-6 flex flex-wrap gap-2" aria-label="Progress">
        {STEPS.map((label, i) => (
          <li key={label}>
            <button onClick={() => (i <= step || canNext) && setStep(i)} aria-current={i === step ? "step" : undefined}
              className={cn("flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                i === step ? "border-primary bg-primary text-primary-foreground" : i < step ? "border-magenta/40 bg-blush text-primary" : "bg-card text-muted-foreground")}>
              <span className="font-display">{i + 1}</span> {label}
            </button>
          </li>
        ))}
      </ol>

      {step === 0 && (
        <Panel className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" htmlFor="n" required><Input id="n" value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} /></Field>
          <Field label="Professional title" htmlFor="t" required><Input id="t" value={p.title} onChange={(e) => setP({ ...p, title: e.target.value })} placeholder="Junior Data Analyst" /></Field>
          <Field label="Email" htmlFor="e"><Input id="e" type="email" value={p.email} onChange={(e) => setP({ ...p, email: e.target.value })} /></Field>
          <Field label="Phone" htmlFor="ph"><Input id="ph" value={p.phone} onChange={(e) => setP({ ...p, phone: e.target.value })} /></Field>
          <Field label="Location" htmlFor="l"><Input id="l" value={p.location} onChange={(e) => setP({ ...p, location: e.target.value })} placeholder="Johannesburg, South Africa" /></Field>
          <Field label="Links (optional)" htmlFor="lk"><Input id="lk" value={p.links} onChange={(e) => setP({ ...p, links: e.target.value })} placeholder="linkedin.com/in/…" /></Field>
          <p className="text-xs text-muted-foreground sm:col-span-2">Privacy: don't include ID numbers or other sensitive data. Contact details stay in your browser and are not sent to the AI.</p>
        </Panel>
      )}

      {step === 1 && (
        <Panel className="space-y-4">
          <Field label="Target role" htmlFor="tr"><Input id="tr" value={s.target} onChange={(e) => setS({ ...s, target: e.target.value })} /></Field>
          <Field label="Your experience in a few lines" htmlFor="ex"><Textarea id="ex" rows={4} value={s.experience} onChange={(e) => setS({ ...s, experience: e.target.value })} /></Field>
          <Field label="Career goals" htmlFor="cg"><Textarea id="cg" rows={2} value={s.goals} onChange={(e) => setS({ ...s, goals: e.target.value })} /></Field>
          <Button onClick={genSummary} disabled={summaryAi.loading}>{summaryAi.loading ? <Loader2 className="animate-spin" /> : <Wand2 />} Generate summary</Button>
          {summaryAi.error && <p className="text-sm text-destructive">{summaryAi.error}</p>}
          <Field label="Professional summary (editable)" htmlFor="sum"><Textarea id="sum" rows={4} value={s.summary} onChange={(e) => setS({ ...s, summary: e.target.value })} /></Field>
        </Panel>
      )}

      {step === 2 && (
        <div className="space-y-4">
          {jobs.map((j, i) => (
            <Panel key={i} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Job title" htmlFor={`r${i}`}><Input id={`r${i}`} value={j.role} onChange={(e) => setJob(i, { role: e.target.value })} /></Field>
                <Field label="Employer" htmlFor={`c${i}`}><Input id={`c${i}`} value={j.company} onChange={(e) => setJob(i, { company: e.target.value })} /></Field>
                <Field label="Dates" htmlFor={`d${i}`}><Input id={`d${i}`} value={j.dates} onChange={(e) => setJob(i, { dates: e.target.value })} placeholder="Jan 2023 – Present" /></Field>
              </div>
              <Field label="Responsibilities & achievements" htmlFor={`x${i}`}><Textarea id={`x${i}`} rows={3} value={j.text} onChange={(e) => setJob(i, { text: e.target.value })} /></Field>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => improveJob(i)} disabled={busyIdx !== null}>{busyIdx === i ? <Loader2 className="animate-spin" /> : <Wand2 />} Improve wording</Button>
                {jobs.length > 1 && <Button size="sm" variant="ghost" onClick={() => setJobs(jobs.filter((_, n) => n !== i))}><Trash2 /> Remove</Button>}
              </div>
              {j.improved && <Field label="Improved bullets (editable — check facts)" htmlFor={`im${i}`}><Textarea id={`im${i}`} rows={5} value={j.improved} onChange={(e) => setJob(i, { improved: e.target.value })} /></Field>}
            </Panel>
          ))}
          {jobAi.error && <p className="text-sm text-destructive">{jobAi.error}</p>}
          <Button variant="soft" onClick={() => setJobs([...jobs, { role: "", company: "", dates: "", text: "", improved: "" }])}><Plus /> Add another role</Button>
        </div>
      )}

      {step === 3 && (
        <Panel className="grid gap-4 sm:grid-cols-2">
          <Field label="Technical skills" htmlFor="ts"><Textarea id="ts" rows={3} value={k.tech} onChange={(e) => setK({ ...k, tech: e.target.value })} placeholder="Excel, SQL, Power BI" /></Field>
          <Field label="Soft skills" htmlFor="ss"><Textarea id="ss" rows={3} value={k.soft} onChange={(e) => setK({ ...k, soft: e.target.value })} /></Field>
          <Field label="Education" htmlFor="ed"><Textarea id="ed" rows={3} value={k.education} onChange={(e) => setK({ ...k, education: e.target.value })} /></Field>
          <Field label="Certifications" htmlFor="ce"><Textarea id="ce" rows={3} value={k.certs} onChange={(e) => setK({ ...k, certs: e.target.value })} /></Field>
          <div className="space-y-3 sm:col-span-2">
            <Field label="Job description (optional) — for keyword suggestions" htmlFor="jd"><Textarea id="jd" rows={4} value={jd} onChange={(e) => setJd(e.target.value)} maxLength={15000} /></Field>
            <Button variant="outline" disabled={kwAi.loading} onClick={() => { if (!jd.trim()) return void toast.error("Paste a job description first."); kwAi.run("resume-keywords", { target: s.target, resume: md, job: jd }); }}>
              {kwAi.loading ? <Loader2 className="animate-spin" /> : <Wand2 />} Suggest keywords
            </Button>
            {kwAi.error && <p className="text-sm text-destructive">{kwAi.error}</p>}
            {kwAi.text && (
              <div className="rounded-xl border border-dashed border-magenta/50 bg-blush/40 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-magenta">Unverified suggestions — only add what's true for you</p>
                <Markdown>{kwAi.text}</Markdown>
              </div>
            )}
          </div>
        </Panel>
      )}

      {(step === 4 || step === 5) && (
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <article className={cn("print-area rounded-2xl border bg-card p-8 shadow-card sm:p-10",
            tpl === "Modern" && "border-t-8 border-t-primary", tpl === "ATS plain" && "font-sans [&_h1]:font-sans [&_h2]:font-sans [&_h3]:font-sans")}>
            <Markdown className={cn(tpl === "ATS plain" && "[&_h1]:!text-foreground [&_h2]:!text-foreground [&_h3]:!text-foreground")}>{md}</Markdown>
          </article>
          <aside className="no-print space-y-4">
            {step === 5 ? (
              <Panel className="space-y-3">
                <h2 className="font-semibold text-primary">Template</h2>
                {TEMPLATES.map((t) => (
                  <button key={t} onClick={() => setTpl(t)} aria-pressed={tpl === t} className={cn("w-full rounded-xl border px-3 py-2 text-left text-sm", tpl === t ? "border-primary bg-blush font-semibold text-primary" : "hover:bg-accent")}>{t}</button>
                ))}
                <Button className="w-full" onClick={() => window.print()}><Printer /> Print / Save as PDF</Button>
                <Button className="w-full" variant="magenta" onClick={finish}><Save /> Save resume</Button>
                <p className="text-xs text-muted-foreground">Use your browser's "Save as PDF" option in the print dialog.</p>
              </Panel>
            ) : (
              <Panel><p className="text-sm text-muted-foreground">Check every line is accurate. Go back to any step to edit, then continue to templates & export.</p></Panel>
            )}
            <AiDisclaimer>Resume suggestions are advisory and may reflect bias. They don't guarantee ATS success or a job offer.</AiDisclaimer>
          </aside>
        </div>
      )}

      <div className="no-print mt-6 flex justify-between">
        <Button variant="outline" disabled={step === 0} onClick={() => setStep(step - 1)}><ArrowLeft /> Back</Button>
        {step < STEPS.length - 1 && (
          <Button disabled={!canNext} onClick={() => setStep(step + 1)}>Next <ArrowRight /></Button>
        )}
      </div>
    </AppShell>
  );
}
