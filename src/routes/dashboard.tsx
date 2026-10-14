import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock, ListChecks, Activity as ActivityIcon, Bookmark, Plus, LayoutDashboard } from "lucide-react";
import { AppShell, PageHeader } from "@/components/ws/AppShell";
import { Panel } from "@/components/ws/Output";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { actions, useStore, type Stats } from "@/lib/store";
import { TOOLS } from "@/lib/tools";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/dashboard")({
  head: () => seo("Dashboard", "Your WorkSmart AI workspace: tools, tasks, activity and productivity summary."),
  component: Dashboard,
});

const STAT_LABELS: [keyof Stats, string][] = [
  ["email", "Emails generated"], ["meeting", "Meeting summaries"], ["research", "Research summaries"],
  ["resume", "Resumes created"], ["plan", "Schedules planned"], ["chat", "Assistant replies"],
];

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

function Dashboard() {
  const { stats, tasks, activity, saved, settings } = useStore((s) => s);
  const done = tasks.filter((t) => t.done).length;
  const pending = tasks.length - done;
  const totalGen = STAT_LABELS.reduce((n, [k]) => n + stats[k], 0);
  const minutes = STAT_LABELS.reduce((n, [k]) => n + stats[k] * settings.minutesSaved[k], 0);

  return (
    <AppShell>
      <PageHeader icon={LayoutDashboard} title={`${greeting()} 👋`} description="Here's your workspace. Every number below comes from your own activity in this browser — nothing is invented." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-gradient-brand p-5 text-primary-foreground shadow-elegant">
          <p className="text-sm opacity-80">AI outputs generated</p>
          <p className="mt-1 font-display text-4xl font-semibold">{totalGen}</p>
        </div>
        <Panel className="!p-5"><p className="text-sm text-muted-foreground">Pending tasks</p><p className="mt-1 font-display text-4xl font-semibold text-primary">{pending}</p></Panel>
        <Panel className="!p-5"><p className="text-sm text-muted-foreground">Completed tasks</p><p className="mt-1 font-display text-4xl font-semibold text-primary">{done}</p></Panel>
        <Panel className="!p-5">
          <Tooltip>
            <TooltipTrigger asChild><p className="w-fit cursor-help text-sm text-muted-foreground underline decoration-dotted">Est. time saved</p></TooltipTrigger>
            <TooltipContent>An estimate based on the minutes-per-output you set below — not a measured value.</TooltipContent>
          </Tooltip>
          <p className="mt-1 font-display text-4xl font-semibold text-magenta">{minutes >= 60 ? `${(minutes / 60).toFixed(1)}h` : `${minutes}m`}</p>
        </Panel>
      </div>

      <h2 className="mb-4 mt-10 text-2xl font-semibold text-primary">Quick access</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((t) => (
          <Link key={t.to} to={t.to} className="group flex items-center gap-4 rounded-2xl border bg-card p-4 shadow-card transition hover:-translate-y-0.5 hover:border-magenta/40">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blush text-primary group-hover:bg-gradient-brand group-hover:text-primary-foreground"><t.icon className="size-5" /></div>
            <div className="min-w-0 flex-1"><p className="font-semibold text-primary">{t.label}</p><p className="truncate text-xs text-muted-foreground">{t.description}</p></div>
            <ArrowRight className="size-4 text-muted-foreground group-hover:text-magenta" />
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <Panel>
          <div className="mb-4 flex items-center justify-between"><h2 className="flex items-center gap-2 text-lg font-semibold text-primary"><ListChecks className="size-4" /> Tasks</h2>
            <Button asChild size="sm" variant="soft"><Link to="/planner"><Plus /> Add</Link></Button></div>
          {tasks.length === 0 ? <p className="text-sm text-muted-foreground">No tasks yet. Add some in the Task Planner.</p> : (
            <>
              <Progress value={(done / tasks.length) * 100} className="mb-4 h-2" />
              <ul className="space-y-2 text-sm">{tasks.filter((t) => !t.done).slice(0, 5).map((t) => <li key={t.id} className="flex justify-between gap-2"><span className="truncate">{t.name}</span><span className="shrink-0 text-xs text-muted-foreground">{t.deadline || "—"}</span></li>)}</ul>
              {pending === 0 && <p className="text-sm text-success">All tasks completed 🎉</p>}
            </>
          )}
        </Panel>
        <Panel>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-primary"><ActivityIcon className="size-4" /> Recent activity</h2>
          {activity.length === 0 ? <p className="text-sm text-muted-foreground">No activity yet. Try any tool to get started.</p> : (
            <ul className="space-y-3 text-sm">{activity.slice(0, 6).map((a) => <li key={a.id} className="flex gap-3"><span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-magenta" /><div className="min-w-0"><p className="truncate">{a.label}</p><p className="text-xs text-muted-foreground">{new Date(a.at).toLocaleString()}</p></div></li>)}</ul>
          )}
        </Panel>
        <Panel>
          <div className="mb-4 flex items-center justify-between"><h2 className="flex items-center gap-2 text-lg font-semibold text-primary"><Bookmark className="size-4" /> Saved outputs</h2>
            <Button asChild size="sm" variant="link" className="text-magenta"><Link to="/saved">View all</Link></Button></div>
          {saved.length === 0 ? <p className="text-sm text-muted-foreground">Nothing saved yet. Press Save on any result to keep it.</p> : (
            <ul className="space-y-2 text-sm">{saved.slice(0, 5).map((s) => <li key={s.id} className="flex justify-between gap-2"><span className="truncate">{s.title}</span><span className="shrink-0 text-xs capitalize text-muted-foreground">{s.type}</span></li>)}</ul>
          )}
        </Panel>
      </div>

      <Panel className="mt-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-primary"><Clock className="size-4" /> Productivity summary</h2>
        <p className="mt-1 text-sm text-muted-foreground">Counts are recorded from real use. Adjust the minutes each output saves you to tune the <strong>estimate</strong>.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {STAT_LABELS.map(([k, label]) => (
            <div key={k} className="flex items-center justify-between gap-3 rounded-xl border p-3">
              <div><p className="text-sm font-medium">{label}</p><p className="font-display text-2xl font-semibold text-primary">{stats[k]}</p></div>
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Input type="number" min={0} max={240} value={settings.minutesSaved[k]} onChange={(e) => actions.setMinutes(k, Math.max(0, Math.min(240, Number(e.target.value) || 0)))} className="h-8 w-16" aria-label={`Minutes saved per ${label}`} />
                min each
              </label>
            </div>
          ))}
        </div>
      </Panel>
    </AppShell>
  );
}
