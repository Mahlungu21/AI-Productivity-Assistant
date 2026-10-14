import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Bookmark, Copy, Pencil, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/ws/AppShell";
import { Markdown, copyText } from "@/components/ws/Output";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { actions, useStore, type SavedItem, type SavedType } from "@/lib/store";
import { seo } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/saved")({
  head: () => seo("My Saved Work", "Review, edit and delete your saved emails, summaries, plans and resumes."),
  component: SavedPage,
});

const LABELS: Record<SavedType, string> = { email: "Email", meeting: "Meeting", research: "Research", resume: "Resume", plan: "Plan", chat: "Chat" };

function Item({ item }: { item: SavedItem }) {
  const [edit, setEdit] = useState(false);
  const [open, setOpen] = useState(false);
  const [d, setD] = useState({ title: item.title, content: item.content });
  return (
    <li className="rounded-2xl border bg-card p-5 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="rounded-full bg-blush px-2 py-0.5 text-[11px] font-semibold uppercase text-primary">{LABELS[item.type]}</span>
          {edit ? <Input className="mt-2" value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} aria-label="Title" />
            : <h3 className="mt-2 truncate text-lg font-semibold text-primary">{item.title}</h3>}
          <p className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</p>
        </div>
        <div className="flex gap-1">
          {edit ? (
            <>
              <Button size="sm" onClick={() => { actions.updateSaved(item.id, d); setEdit(false); toast.success("Updated"); }}><Check /> Save</Button>
              <Button size="sm" variant="ghost" onClick={() => { setD({ title: item.title, content: item.content }); setEdit(false); }}><X /></Button>
            </>
          ) : (
            <>
              <Button size="icon" variant="ghost" aria-label="Copy" onClick={() => copyText(item.content)}><Copy /></Button>
              <Button size="icon" variant="ghost" aria-label="Edit" onClick={() => { setEdit(true); setOpen(true); }}><Pencil /></Button>
              <Button size="icon" variant="ghost" aria-label="Delete" onClick={() => { if (confirm("Delete this item permanently?")) { actions.deleteSaved(item.id); toast.success("Deleted"); } }}><Trash2 /></Button>
            </>
          )}
        </div>
      </div>
      <div className="mt-3">
        {edit ? <Textarea rows={12} className="font-mono text-sm" value={d.content} onChange={(e) => setD({ ...d, content: e.target.value })} />
          : (
            <>
              <div className={cn(!open && "max-h-32 overflow-hidden [mask-image:linear-gradient(to_bottom,black_50%,transparent)]")}><Markdown>{item.content}</Markdown></div>
              <Button variant="link" className="px-0 text-magenta" onClick={() => setOpen(!open)}>{open ? "Show less" : "Show more"}</Button>
            </>
          )}
      </div>
    </li>
  );
}

function SavedPage() {
  const saved = useStore((s) => s.saved);
  const [filter, setFilter] = useState<SavedType | "all">("all");
  const list = filter === "all" ? saved : saved.filter((s) => s.type === filter);
  return (
    <AppShell>
      <PageHeader icon={Bookmark} title="My Saved Work" description="Everything you saved, stored privately in this browser. Edit or delete anything at any time." />
      <div className="mb-5 flex flex-wrap gap-2">
        {(["all", ...Object.keys(LABELS)] as const).map((k) => (
          <button key={k} onClick={() => setFilter(k as SavedType | "all")} aria-pressed={filter === k}
            className={cn("rounded-full border px-3 py-1.5 text-xs font-medium", filter === k ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-accent")}>
            {k === "all" ? "All" : LABELS[k as SavedType]}
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card p-12 text-center">
          <Bookmark className="mx-auto size-8 text-magenta" />
          <h2 className="mt-3 text-xl font-semibold text-primary">Nothing saved yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">Generate something and press Save to keep it here.</p>
          <Button asChild className="mt-5"><Link to="/email">Write an email</Link></Button>
        </div>
      ) : (
        <ul className="space-y-4">{list.map((i) => <Item key={i.id} item={i} />)}</ul>
      )}
    </AppShell>
  );
}
