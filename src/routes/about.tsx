import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Info } from "lucide-react";
import { AppShell, PageHeader } from "@/components/ws/AppShell";
import { Panel } from "@/components/ws/Output";
import { Button } from "@/components/ui/button";
import { actions } from "@/lib/store";
import { toast } from "sonner";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () => seo("About This Project", "Problem, solution, prompt engineering and responsible AI approach behind WorkSmart AI."),
  component: About,
});

const CHECKLIST = [
  "Landing page with feature cards and working navigation",
  "Dashboard with real activity, tasks and configurable time-saved estimate",
  "Smart Email Generator — generate, regenerate, change tone, edit, copy, save",
  "Meeting Notes Summarizer — summary, decisions and action-item table",
  "AI Task Planner — add/edit/complete/delete tasks and AI schedule",
  "AI Research Assistant — five output formats, facts vs. analysis",
  "AI Resume Builder — six steps, templates, print-to-PDF, keyword suggestions",
  "WorkSmart Assistant chatbot — streaming replies, prompt chips, links to tools",
  "My Saved Work — edit and delete saved items",
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <Panel><h2 className="text-xl font-semibold text-primary">{title}</h2><div className="mt-3 space-y-2 text-sm leading-relaxed text-foreground/85">{children}</div></Panel>;
}

function About() {
  return (
    <AppShell>
      <PageHeader icon={Info} title="About This Project" description="WorkSmart AI was built for the CAPACITI AI Skill Accelerator Programme." />
      <div className="grid gap-5 lg:grid-cols-2">
        <Section title="Problem statement"><p>Professionals spend significant time on repetitive tasks such as email writing, summarising information, planning schedules and conducting research.</p></Section>
        <Section title="Proposed solution"><p>WorkSmart AI provides an integrated workspace that automates common productivity and career tasks with AI, while keeping the human in control of every output.</p></Section>
        <Section title="Tools used">
          <ul className="list-disc pl-5">
            <li>Lovable — app building and hosting</li>
            <li>Lovable AI — a large language model called securely from the server (no keys in the browser)</li>
            <li>Lovable Cloud — server-side functions</li>
            <li>Browser storage — saved work, tasks and activity are kept privately on your device (no sign-in needed for this demo)</li>
          </ul>
        </Section>
        <Section title="Prompt engineering strategy">
          <p>Every tool has its own prompt with six parts:</p>
          <ol className="list-decimal pl-5">
            <li><strong>Role</strong> — e.g. "professional communication assistant"</li>
            <li><strong>Task</strong> — exactly what to produce</li>
            <li><strong>Context</strong> — the user's inputs, clearly delimited</li>
            <li><strong>Constraints</strong> — tone, length, accuracy, "use only supplied facts"</li>
            <li><strong>Output format</strong> — fixed headings and tables</li>
            <li><strong>Validation</strong> — flag missing info as "Not specified" instead of guessing</li>
          </ol>
        </Section>
        <Section title="Challenges and solutions">
          <ul className="list-disc pl-5">
            <li><strong>Hallucinated details</strong> — prompts forbid inventing names, dates and owners, and require "Not specified".</li>
            <li><strong>Keeping credentials safe</strong> — all AI calls run on the server.</li>
            <li><strong>Honest metrics</strong> — the dashboard only counts real actions; time saved is a labelled, adjustable estimate.</li>
            <li><strong>Duplicate submissions</strong> — buttons lock while a request is running.</li>
          </ul>
        </Section>
        <Section title="Responsible AI">
          <ul className="list-disc pl-5">
            <li>AI output can contain errors — review before use.</li>
            <li>No web access: research answers state that no live sources were used and never include invented citations.</li>
            <li>Resume suggestions may carry bias and are advisory; no hiring outcome is guaranteed.</li>
            <li>Avoid pasting confidential or personal data. Text you submit is sent to the AI model only to generate your result.</li>
            <li>You can edit or delete anything you've saved.</li>
          </ul>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => { if (confirm("Delete all saved work, tasks and activity from this browser?")) { actions.clearAll(); toast.success("All local data deleted"); } }}>Delete all my data</Button>
        </Section>
        <Section title="Impact"><p>By drafting first versions, structuring notes and proposing schedules, WorkSmart AI removes repetitive work and helps users focus on decisions. Real usage figures are shown on the Dashboard and come only from recorded activity.</p></Section>
        <Section title="Demonstration checklist">
          <ul className="space-y-1.5">{CHECKLIST.map((c) => <li key={c} className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-magenta" />{c}</li>)}</ul>
        </Section>
      </div>
    </AppShell>
  );
}
