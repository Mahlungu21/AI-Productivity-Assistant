import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8", className)} aria-hidden>
      <rect width="32" height="32" rx="9" className="fill-primary" />
      <path d="M7 10l3.6 12L14 13l2 6 2-6 3.4 9L25 10" fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="stroke-primary-foreground" />
      <circle cx="25" cy="8" r="2.4" className="fill-magenta" />
    </svg>
  );
}

export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="WorkSmart AI home">
      <LogoMark />
      <span className={cn("font-display text-lg font-semibold tracking-tight", inverted ? "text-sidebar-accent-foreground" : "text-primary")}>
        WorkSmart <span className="text-magenta">AI</span>
      </span>
    </Link>
  );
}
