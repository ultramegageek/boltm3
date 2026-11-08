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
  { id: "leadership", name: "FIRST Leadership Award", description: "Formerly Dean's List Award, this individual award recognizes outstanding student leaders in 10th or 11th grade. Recipients demonstrate exceptional passion, technical leadership, commitment to FIRST values, and an ability to inspire their teammates and community." },
  { id: "inspire", name: "Inspire Award", description: 'The most prestigious FTC award. It is presented to the team that best embodies the "challenge" of the FIRST Tech Challenge program. This team is a top contender for all other judged awards, demonstrates high technical proficiency, showcases strong team spirit, and actively performs outreach to spread STEM within their community.' },
  { id: "think", name: "Think Award", description: "This award removes the focus from the physical robot and highlights the team's engineering process. It is given to the team that best reflects the journey they took through their Engineering Portfolio, detailing their math, science, and engineering design process." },
  { id: "connect", name: "Connect Award", description: "This award recognizes the team that best connects with their local STEM community. The winning team reaches out to professional engineers, businesses, and mentors to gain insight, learn real-world applications, and build strong community partnerships." },
  { id: "innovate", name: "Innovate Award sponsored by RTX", description: "This award celebrates creativity and out-of-the-box thinking. It is given to the team that designs a highly innovative, functional, and practical robot component or mechanism that solves a specific game challenge in a unique way." },
  { id: "design", name: "Design Award", description: "This award emphasizes the aesthetic, practical, and functional design of the robot. The winning robot must be durable, well-thought-out, and display a clear industrial design where form meets function seamlessly." },
  { id: "reach", name: "Reach Award", description: "An award given to teams that excel at introducing FIRST and STEM to non-traditional or underrepresented audiences. They demonstrate impact by expanding access to technology education and inspiring new communities." },
  { id: "sustain", name: "Sustain Award", description: "This award recognizes teams that demonstrate long-term sustainability, strong financial planning, effective mentorship models, and structured organizational growth to ensure the team continues to thrive year after year." },
  { id: "control", name: "Control Award", description: "This award celebrates the team that uses sensors, custom software, and control algorithms to make their robot operate efficiently and autonomously. It highlights advanced programming, reliable sensor feedback, and precise driver control." },
  { id: "compass", name: "Compass Award", optional: true, description: "An award presented to an outstanding Coach or Mentor who has provided exceptional guidance, leadership, and support to the team throughout the season. The winner is selected based on a video submission created by the team members." },
  { id: "judges", name: "Judges' Choice Award", optional: true, description: "During the competition, judges may encounter a team whose unique efforts, perseverance, spirit, or story do not fit neatly into any standard award category. The judges present this special award to honor that team's remarkable achievements." },
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
