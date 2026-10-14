import {
  LayoutDashboard,
  Mail,
  NotebookPen,
  CalendarCheck,
  Microscope,
  FileUser,
  MessagesSquare,
  Bookmark,
  Info,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  to: "/dashboard" | "/email" | "/meetings" | "/planner" | "/research" | "/resume" | "/chat" | "/saved" | "/about";
  label: string;
  icon: LucideIcon;
  description?: string;
};

export const TOOLS: NavItem[] = [
  { to: "/email", label: "Smart Email Generator", icon: Mail, description: "Draft polished emails in the right tone from a few key points." },
  { to: "/meetings", label: "Meeting Notes Summarizer", icon: NotebookPen, description: "Turn messy notes into decisions, owners and action items." },
  { to: "/planner", label: "AI Task Planner", icon: CalendarCheck, description: "Prioritise tasks and get a realistic, conflict-aware schedule." },
  { to: "/research", label: "AI Research Assistant", icon: Microscope, description: "Simplify articles and questions into clear findings." },
  { to: "/resume", label: "AI Resume Builder", icon: FileUser, description: "Build an honest, ATS-friendly resume step by step." },
  { to: "/chat", label: "WorkSmart Assistant", icon: MessagesSquare, description: "Ask anything about work, writing or your career." },
];

export const NAV: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ...TOOLS,
  { to: "/saved", label: "My Saved Work", icon: Bookmark },
  { to: "/about", label: "About the Project", icon: Info },
];
