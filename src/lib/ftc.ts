export const EVENTS = [
  { id: "almaty-scrim", name: "Almaty FIRST Scrimmage", date: "2026-10-24T09:00:00+05:00" },
  { id: "kz-scrim", name: "Kazakhstan FIRST Scrimmage", date: "2026-11-01T09:00:00+05:00" },
  { id: "almaty-reg", name: "Almaty FIRST Regional", date: "2026-11-28T09:00:00+05:00" },
  { id: "jetisu-reg", name: "Jetisu FIRST Regional", date: "2026-12-03T09:00:00+05:00" },
  { id: "ontustik-q", name: "Ontustik FIRST Qualifier", date: "2027-01-07T09:00:00+05:00" },
  { id: "daryn-q", name: "Daryn FIRST Qualifier", date: "2027-01-12T09:00:00+05:00" },
  { id: "ca-champ", name: "Central Asian FIRST Championship", date: "2027-02-10T09:00:00+05:00" },
  { id: "worlds", name: "FIRST World Championship", date: "2027-04-29T09:00:00-05:00" },
] as const;

export const OTHER_EVENTS = [
  { id: "quant-live", name: "Quant FTC LiveStream with Coach Pratt", date: "2026-11-08T12:00:00+05:00" },
  { id: "andymark-meet", name: "“Get knowledge with Bolt.m3” — Google Meet with AndyMark", date: "2026-11-11T18:00:00+05:00" },
  { id: "sana-scrim", name: "Sana & Shyraq FTC Scrimmage", date: "2026-11-22T11:00:00+05:00" },
] as const;

export const AWARDS = [
  { id: "leadership", name: "FIRST Leadership Award" },
  { id: "inspire", name: "Inspire Award" },
  { id: "think", name: "Think Award" },
  { id: "connect", name: "Connect Award" },
  { id: "innovate", name: "Innovate Award sponsored by RTX" },
  { id: "design", name: "Design Award" },
  { id: "reach", name: "Reach Award" },
  { id: "sustain", name: "Sustain Award" },
  { id: "control", name: "Control Award" },
  { id: "compass", name: "Compass Award", optional: true },
  { id: "judges", name: "Judges' Choice Award", optional: true },
] as const;

export const STATUSES = [
  { id: "todo", name: "To Do" },
  { id: "in_progress", name: "In Progress" },
  { id: "review", name: "Review" },
  { id: "done", name: "Done" },
] as const;

export const CATEGORIES = ["Hardware", "Software", "Portfolio", "Outreach", "Logistics"] as const;

export const PAGE_STATUSES = [
  { id: "not_started", name: "Not Started" },
  { id: "in_progress", name: "In Progress" },
  { id: "ready", name: "Ready" },
] as const;

export const TEAM_ROLES = [
  "Captain",
  "Hardware",
  "Software",
  "Driver",
  "Outreach",
  "Portfolio",
  "Mentor",
  "Member",
];

/** Readiness = weighted average of task completion and portfolio readiness. */
export function readiness(
  tasks: { status: string }[],
  pages: { status: string }[],
): number {
  const taskScore = tasks.length
    ? tasks.reduce((s, t) => s + ({ todo: 0, in_progress: 0.4, review: 0.8, done: 1 }[t.status] ?? 0), 0) /
      tasks.length
    : 0;
  const pageScore = pages.length
    ? pages.reduce((s, p) => s + ({ not_started: 0, in_progress: 0.5, ready: 1 }[p.status] ?? 0), 0) /
      pages.length
    : 0;
  return Math.round((taskScore * 0.6 + pageScore * 0.4) * 100);
}

export function matchStats(matches: { auto_score: number; teleop_score: number; endgame_score: number }[]) {
  const totals = matches.map((m) => m.auto_score + m.teleop_score + m.endgame_score);
  return {
    high: totals.length ? Math.max(...totals) : 0,
    average: totals.length ? Math.round((totals.reduce((a, b) => a + b, 0) / totals.length) * 10) / 10 : 0,
  };
}

export function initials(name?: string | null) {
  return (name || "?")
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
