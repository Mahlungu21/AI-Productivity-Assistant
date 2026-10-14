import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ClipboardPaste, ShieldCheck, Sparkles as Wand, PencilLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ws/Logo";
import { TOOLS } from "@/lib/tools";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WorkSmart AI — Work Smarter. Achieve More with AI." },
      { name: "description", content: "Your intelligent productivity assistant for emails, meetings, planning, research, and career growth." },
      { property: "og:title", content: "WorkSmart AI — Work Smarter. Achieve More with AI." },
      { property: "og:description", content: "Your intelligent productivity assistant for emails, meetings, planning, research, and career growth." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const STEPS = [
  { icon: ClipboardPaste, title: "Enter or paste", text: "Add your key points, notes, tasks or text." },
  { icon: Wand, title: "AI structures it", text: "Purpose-built prompts turn input into a useful, structured result." },
  { icon: PencilLine, title: "Review & save", text: "Edit, copy or save the output to your workspace." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Logo />
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost" className="hidden sm:inline-flex"><Link to="/about">About</Link></Button>
          <Button asChild><Link to="/dashboard">Open app</Link></Button>
        </nav>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-soft" aria-hidden />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 pb-20 pt-10 lg:grid-cols-[1.05fr_1fr] lg:pt-16">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-semibold text-primary shadow-card">
              <span className="size-1.5 rounded-full bg-magenta" /> CAPACITI AI Skill Accelerator project
            </span>
            <h1 className="mt-6 text-5xl font-semibold leading-[1.05] text-primary sm:text-6xl">
              Work Smarter. <br />
              <span className="italic text-magenta">Achieve More</span> with AI.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              Your intelligent productivity assistant for emails, meetings, planning, research, and career growth.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="hero" size="lg"><Link to="/dashboard">Get Started <ArrowRight /></Link></Button>
              <Button asChild variant="outline" size="lg" className="rounded-full"><a href="#features">Explore Features</a></Button>
            </div>
            <p className="mt-8 max-w-md text-sm text-muted-foreground">
              Hand off the repetitive parts of your day — first drafts, summaries and schedules — so you can focus on decisions and people.
            </p>
          </div>
          <img src={hero} alt="Illustration of email, documents and calendar cards floating together" width={1280} height={1024} className="w-full animate-in fade-in zoom-in-95 duration-1000" />
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="text-center text-4xl font-semibold text-primary">Six tools, one workspace</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">Each tool uses its own carefully engineered prompt so results stay accurate and on-task.</p>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((t) => (
            <div key={t.to} className="group flex flex-col rounded-2xl border bg-card p-6 shadow-card transition hover:-translate-y-1 hover:shadow-elegant">
              <div className="flex size-11 items-center justify-center rounded-xl bg-blush text-primary group-hover:bg-gradient-brand group-hover:text-primary-foreground"><t.icon className="size-5" /></div>
              <h3 className="mt-5 text-xl font-semibold text-primary">{t.label}</h3>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{t.description}</p>
              <Button asChild variant="link" className="mt-4 self-start px-0 text-magenta"><Link to={t.to}>Open tool <ArrowRight /></Link></Button>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-blush/60 py-20">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-center text-4xl font-semibold text-primary">How it works</h2>
          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="rounded-2xl bg-card p-6 shadow-card">
                <span className="font-display text-4xl font-semibold text-magenta">0{i + 1}</span>
                <div className="mt-3 flex items-center gap-2"><s.icon className="size-4 text-primary" /><h3 className="text-lg font-semibold text-primary">{s.title}</h3></div>
                <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-20">
        <div className="rounded-3xl bg-gradient-brand p-8 text-primary-foreground shadow-elegant sm:p-12">
          <ShieldCheck className="size-8" />
          <h2 className="mt-4 text-3xl font-semibold">Built with responsible AI</h2>
          <p className="mt-3 max-w-2xl opacity-90">
            WorkSmart AI is told never to invent facts, deadlines, achievements or citations. Still, AI can be wrong — always review results before relying on them, and avoid pasting confidential information.
          </p>
          <Button asChild variant="secondary" className="mt-6 rounded-full"><Link to="/about">Read our approach</Link></Button>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} WorkSmart AI · A CAPACITI AI Skill Accelerator project
      </footer>
    </div>
  );
}
