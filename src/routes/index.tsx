import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Zap, Trophy, KanbanSquare, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "bolt.m3 — FTC Team Workspace" },
      { name: "description", content: "Plan awards, tasks, matches and your 15-page portfolio together as an FTC team." },
      { property: "og:title", content: "bolt.m3 — FTC Team Workspace" },
      { property: "og:description", content: "Plan awards, tasks, matches and your portfolio together." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/app", replace: true });
    });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => {
      if (s) navigate({ to: "/app", replace: true });
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);
  const features = [
    { icon: Trophy, t: "All 11 FTC awards", d: "Requirements and owners per award." },
    { icon: KanbanSquare, t: "Team Kanban", d: "Hardware, software, outreach, logistics." },
    { icon: BookOpen, t: "Journal & scorer", d: "Daily logs and practice match stats." },
  ];
  return (
    <div className="min-h-screen px-6">
      <header className="mx-auto flex max-w-6xl items-center justify-between py-6">
        <div className="flex items-center gap-2 font-display text-xl font-bold">
          <span className="grid size-8 place-items-center rounded-lg bg-gradient-primary shadow-glow">
            <Zap className="size-4" />
          </span>
          bolt<span className="text-primary">.m3</span>
        </div>
        <Button asChild variant="ghost"><Link to="/auth">Sign in</Link></Button>
      </header>
      <main className="mx-auto max-w-6xl py-20">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">FIRST Tech Challenge · 2026–27</p>
        <h1 className="mt-4 max-w-3xl text-5xl font-bold leading-[1.05] md:text-7xl">
          One workspace for the whole <span className="text-gradient">bolt.m3</span> season.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">
          Countdown to every event, track award readiness, run the build board and finish the portfolio — synced live across the team.
        </p>
        <div className="mt-10 flex gap-3">
          <Button asChild variant="hero" size="lg"><Link to="/auth">Enter workspace</Link></Button>
        </div>
        <div className="mt-24 grid gap-4 md:grid-cols-3">
          {features.map((f) => (
            <div key={f.t} className="glass p-6">
              <f.icon className="size-6 text-primary" />
              <h3 className="mt-4 text-lg font-semibold">{f.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
