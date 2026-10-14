import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, ShieldCheck, X } from "lucide-react";
import { NAV } from "@/lib/tools";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-0.5" aria-label="Main">
      {NAV.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-2 focus-visible:outline-sidebar-ring"
          activeProps={{ className: "bg-sidebar-accent !text-sidebar-accent-foreground font-semibold" }}
        >
          <item.icon className="size-4 shrink-0 opacity-80 group-hover:opacity-100" />
          <span className="truncate">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <div className="px-2 pt-1"><Logo inverted /></div>
      <NavLinks onNavigate={onNavigate} />
      <div className="mt-auto rounded-xl border border-sidebar-border bg-sidebar-accent/50 p-3 text-xs text-sidebar-foreground/80">
        <div className="mb-1 flex items-center gap-1.5 font-semibold text-sidebar-accent-foreground">
          <ShieldCheck className="size-3.5 text-sidebar-primary" /> Responsible AI
        </div>
        AI can make mistakes. Review every output before you use it.
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      <aside className="no-print fixed inset-y-0 left-0 z-30 hidden w-64 bg-sidebar lg:block">
        <SidebarBody />
      </aside>

      <header className="no-print sticky top-0 z-20 flex items-center justify-between border-b bg-background/90 px-4 py-3 backdrop-blur lg:hidden">
        <Logo />
        <button
          onClick={() => setOpen(true)}
          className="rounded-lg p-2 text-primary hover:bg-accent"
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>
      </header>

      <div
        className={cn("no-print fixed inset-0 z-40 lg:hidden", open ? "pointer-events-auto" : "pointer-events-none")}
        aria-hidden={!open}
      >
        <div
          className={cn("absolute inset-0 bg-foreground/40 transition-opacity", open ? "opacity-100" : "opacity-0")}
          onClick={() => setOpen(false)}
        />
        <div className={cn("absolute inset-y-0 left-0 w-72 bg-sidebar transition-transform", open ? "translate-x-0" : "-translate-x-full")}>
          <button
            onClick={() => setOpen(false)}
            className="absolute right-3 top-4 rounded-lg p-1.5 text-sidebar-foreground hover:bg-sidebar-accent"
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
          <SidebarBody onNavigate={() => setOpen(false)} />
        </div>
      </div>

      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">{children}</div>
      </main>
    </div>
  );
}

export function PageHeader({ title, description, icon: Icon, actions }: { title: string; description: string; icon?: React.ComponentType<{ className?: string }>; actions?: ReactNode }) {
  return (
    <div className="no-print mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-start gap-4">
        {Icon && (
          <div className="hidden size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-brand text-primary-foreground shadow-elegant sm:flex">
            <Icon className="size-5" />
          </div>
        )}
        <div>
          <h1 className="text-3xl font-semibold text-primary sm:text-4xl">{title}</h1>
          <p className="mt-1.5 max-w-2xl text-muted-foreground">{description}</p>
        </div>
      </div>
      {actions}
    </div>
  );
}
