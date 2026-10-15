import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarCheck, Plus, Trash2, Wand2, Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/ws/AppShell";
import { Field, OutputPanel, Panel } from "@/components/ws/Output";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAi } from "@/hooks/use-ai";
import { actions, useStore, type Priority, type Task } from "@/lib/store";
import { seo } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/planner")({
  head: () => seo("AI Task Planner", "Prioritise tasks, spot deadline conflicts and get a realistic schedule."),
  component: PlannerPage,
});

const today = () => new Date().toISOString().slice(0, 10);
const blank = { name: "", description: "", priority: "medium" as Priority, deadline: "", duration: "" };

export function PriorityBadge({ p }: { p: Priority }) {
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
      p === "high" ? "bg-magenta text-magenta-foreground" : p === "medium" ? "bg-blush text-primary" : "bg-muted text-muted-foreground")}>
      {p}
    </span>
  );
}

function TaskRow({ t }: { t: Task }) {
  const [edit, setEdit] = useState(false);
  const [d, setD] = useState(t);
  const overdue = !t.done && t.deadline && t.deadline < today();
  if (edit)
    return (
      <li className="space-y-2 rounded-xl border bg-muted/40 p-3">
        <Input value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} aria-label="Task name" />
        <div className="grid grid-cols-3 gap-2">
          <Select value={d.priority} onValueChange={(v) => setD({ ...d, priority: v as Priority })}>
            <SelectTrigger aria-label="Priority"><SelectValue /></SelectTrigger>
            <SelectContent>{["high", "medium", "low"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
          </Select>
          <Input type="date" value={d.deadline} onChange={(e) => setD({ ...d, deadline: e.target.value })} aria-label="Deadline" />
          <Input value={d.duration} onChange={(e) => setD({ ...d, duration: e.target.value })} placeholder="2h" aria-label="Duration" />
        </div>
        <div className="flex gap-1">
          <Button size="sm" onClick={() => { if (!d.name.trim()) return; actions.updateTask(t.id, d); setEdit(false); }}><Check /> Save</Button>
          <Button size="sm" variant="ghost" onClick={() => { setD(t); setEdit(false); }}><X /> Cancel</Button>
        </div>
      </li>
    );
  return (
    <li className="flex items-start gap-3 rounded-xl border bg-card p-3">
      <Checkbox checked={t.done} onCheckedChange={(c) => actions.updateTask(t.id, { done: c === true })} aria-label={`Mark ${t.name} complete`} className="mt-1" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("font-medium", t.done && "text-muted-foreground line-through")}>{t.name}</span>
          <PriorityBadge p={t.priority} />
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {t.deadline ? <span className={cn(overdue && "font-semibold text-destructive")}>Due {t.deadline}{overdue && " · overdue"}</span> : "No deadline"}
          {t.duration && ` · ${t.duration}`}
        </p>
      </div>
      <Button size="icon" variant="ghost" aria-label="Edit task" onClick={() => setEdit(true)}><Pencil /></Button>
      <Button size="icon" variant="ghost" aria-label="Delete task" onClick={() => { actions.deleteTask(t.id); toast.success("Task deleted"); }}><Trash2 /></Button>
    </li>
  );
}

function PlannerPage() {
  const tasks = useStore((s) => s.tasks);
  const [f, setF] = useState(blank);
  const [hours, setHours] = useState("08:00–17:00, Mon–Fri");
  const [constraints, setConstraints] = useState("");
  const ai = useAi();

  const t0 = today();
  const todays = tasks.filter((t) => t.deadline && t.deadline <= t0);
  const upcoming = tasks.filter((t) => !t.deadline || t.deadline > t0);
  const done = tasks.filter((t) => t.done).length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!f.name.trim()) return void toast.error("Give the task a name.");
    actions.addTask(f);
    setF(blank);
    toast.success("Task added");
  }

  async function plan() {
    const open = tasks.filter((t) => !t.done);
    if (!open.length) return void toast.error("Add at least one open task first.");
    const payload = JSON.stringify(open.map(({ name, description, priority, deadline, duration }) => ({ name, description, priority, deadline: deadline || "Not specified", duration: duration || "Not specified" })), null, 1);
    const t = await ai.run("planner", { tasks: payload, hours, constraints, today: t0 });
    if (t) actions.recordGeneration("plan", `Plan for ${open.length} tasks`);
  }

  return (
    <AppShell>
      <PageHeader icon={CalendarCheck} title="AI Task Planner" description="Add your tasks, then let AI prioritise them and propose a realistic schedule. No calendar is connected." />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Panel>
            <h2 className="mb-4 text-lg font-semibold text-primary">Add a task</h2>
            <form onSubmit={add} className="space-y-3">
              <Field label="Task name" htmlFor="tn" required><Input id="tn" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} maxLength={200} /></Field>
              <Field label="Description" htmlFor="td"><Textarea id="td" rows={2} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} maxLength={1000} /></Field>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Priority" htmlFor="tp">
                  <Select value={f.priority} onValueChange={(v) => setF({ ...f, priority: v as Priority })}>
                    <SelectTrigger id="tp"><SelectValue /></SelectTrigger>
                    <SelectContent>{["high", "medium", "low"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Deadline" htmlFor="tdl"><Input id="tdl" type="date" value={f.deadline} onChange={(e) => setF({ ...f, deadline: e.target.value })} /></Field>
                <Field label="Duration" htmlFor="tdu"><Input id="tdu" value={f.duration} onChange={(e) => setF({ ...f, duration: e.target.value })} placeholder="2h" maxLength={30} /></Field>
              </div>
              <Button type="submit"><Plus /> Add task</Button>
            </form>
          </Panel>

          <Panel>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-primary">Your tasks</h2>
              <span className="text-sm text-muted-foreground">{done}/{tasks.length} done</span>
            </div>
            <Progress value={pct} className="mb-5 h-2" aria-label="Completion progress" />
            {tasks.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No tasks yet — add your first one above.</p>
            ) : (
              <div className="space-y-5">
                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Today & overdue ({todays.length})</h3>
                  <ul className="space-y-2">{todays.map((t) => <TaskRow key={t.id} t={t} />)}</ul>
                </div>
                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Upcoming ({upcoming.length})</h3>
                  <ul className="space-y-2">{upcoming.map((t) => <TaskRow key={t.id} t={t} />)}</ul>
                </div>
              </div>
            )}
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Working hours" htmlFor="wh"><Input id="wh" value={hours} onChange={(e) => setHours(e.target.value)} maxLength={200} /></Field>
              <Field label="Constraints" htmlFor="wc"><Input id="wc" value={constraints} onChange={(e) => setConstraints(e.target.value)} placeholder="e.g. No meetings Friday" maxLength={500} /></Field>
            </div>
            <Button className="mt-4 w-full" variant="hero" onClick={plan} disabled={ai.loading}><Wand2 /> {ai.loading ? "Planning…" : "Generate AI schedule"}</Button>
          </Panel>
          <OutputPanel text={ai.text} loading={ai.loading} error={ai.error} saveType="plan" saveTitle={`Schedule ${t0}`} onRegenerate={plan} emptyHint="Your prioritised order, schedule and conflict warnings will appear here." />
        </div>
      </div>
    </AppShell>
  );
}
