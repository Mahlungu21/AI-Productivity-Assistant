import { useSyncExternalStore } from "react";

export type SavedType = "email" | "meeting" | "research" | "resume" | "plan" | "chat";
export type SavedItem = { id: string; type: SavedType; title: string; content: string; createdAt: number };
export type Priority = "high" | "medium" | "low";
export type Task = {
  id: string;
  name: string;
  description: string;
  priority: Priority;
  deadline: string; // yyyy-mm-dd
  duration: string;
  done: boolean;
  createdAt: number;
};
export type Activity = { id: string; kind: string; label: string; at: number };
export type Stats = { email: number; meeting: number; research: number; resume: number; plan: number; chat: number };
export type Settings = { minutesSaved: Record<keyof Stats, number> };

type State = { saved: SavedItem[]; tasks: Task[]; activity: Activity[]; stats: Stats; settings: Settings };

const KEY = "worksmart-ai:v1";
const empty: State = {
  saved: [],
  tasks: [],
  activity: [],
  stats: { email: 0, meeting: 0, research: 0, resume: 0, plan: 0, chat: 0 },
  settings: { minutesSaved: { email: 10, meeting: 20, research: 25, resume: 30, plan: 15, chat: 3 } },
};

let state: State = empty;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<State>;
      state = {
        ...empty,
        ...p,
        stats: { ...empty.stats, ...p.stats },
        settings: { minutesSaved: { ...empty.settings.minutesSaved, ...p.settings?.minutesSaved } },
      };
    }
  } catch {
    state = empty;
  }
}

function set(fn: (s: State) => State) {
  load();
  state = fn(state);
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage full or blocked */
  }
  listeners.forEach((l) => l());
}

export function useStore<T>(select: (s: State) => T): T {
  return useSyncExternalStore(
    (cb) => {
      load();
      listeners.add(cb);
      cb();
      return () => listeners.delete(cb);
    },
    () => {
      load();
      return select(state);
    },
    () => select(empty),
  );
}

export const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

function logActivity(s: State, kind: string, label: string): Activity[] {
  return [{ id: uid(), kind, label, at: Date.now() }, ...s.activity].slice(0, 40);
}

export const actions = {
  recordGeneration(kind: keyof Stats, label: string) {
    set((s) => ({ ...s, stats: { ...s.stats, [kind]: s.stats[kind] + 1 }, activity: logActivity(s, kind, label) }));
  },
  save(item: Omit<SavedItem, "id" | "createdAt">) {
    set((s) => ({
      ...s,
      saved: [{ ...item, id: uid(), createdAt: Date.now() }, ...s.saved],
      activity: logActivity(s, item.type, `Saved: ${item.title}`),
    }));
  },
  updateSaved(id: string, patch: Partial<SavedItem>) {
    set((s) => ({ ...s, saved: s.saved.map((i) => (i.id === id ? { ...i, ...patch } : i)) }));
  },
  deleteSaved(id: string) {
    set((s) => ({ ...s, saved: s.saved.filter((i) => i.id !== id) }));
  },
  addTask(t: Omit<Task, "id" | "createdAt" | "done">) {
    set((s) => ({
      ...s,
      tasks: [...s.tasks, { ...t, id: uid(), createdAt: Date.now(), done: false }],
      activity: logActivity(s, "task", `Added task: ${t.name}`),
    }));
  },
  updateTask(id: string, patch: Partial<Task>) {
    set((s) => {
      const before = s.tasks.find((t) => t.id === id);
      const completing = before && patch.done === true && !before.done;
      return {
        ...s,
        tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        activity: completing ? logActivity(s, "task", `Completed: ${before.name}`) : s.activity,
      };
    });
  },
  deleteTask(id: string) {
    set((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) }));
  },
  setMinutes(kind: keyof Stats, minutes: number) {
    set((s) => ({ ...s, settings: { minutesSaved: { ...s.settings.minutesSaved, [kind]: minutes } } }));
  },
  clearAll() {
    set(() => empty);
  },
};
