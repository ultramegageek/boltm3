import { useEffect, useState } from "react";
import { EVENTS, readiness, STATUSES } from "@/lib/ftc";
import { Field, SectionTitle, type WsProps } from "./shared";

export function Overview({ data }: WsProps) {
  const [eventId, setEventId] = useState<string>(
    () => EVENTS.find((e) => new Date(e.date).getTime() > Date.now())?.id ?? "worlds",
  );
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const ev = EVENTS.find((e) => e.id === eventId)!;
  const diff = Math.max(0, new Date(ev.date).getTime() - now);
  const parts = [
    ["Days", Math.floor(diff / 86400000)],
    ["Hours", Math.floor(diff / 3600000) % 24],
    ["Minutes", Math.floor(diff / 60000) % 60],
    ["Seconds", Math.floor(diff / 1000) % 60],
  ] as const;
  const pct = readiness(data.tasks, data.pages);
  const r = 70;
  const c = 2 * Math.PI * r;

  return (
    <div>
      <SectionTitle title="Overview" sub="Live countdown and team readiness" />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass p-6 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="w-full sm:w-80">
              <Field value={eventId} onChange={setEventId} options={EVENTS.map((e) => [e.id, e.name])} />
            </div>
            <p className="font-mono text-sm text-muted-foreground">
              {new Date(ev.date).toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" })}
            </p>
          </div>
          {diff === 0 ? (
            <p className="mt-10 text-4xl font-bold text-primary">Event day / completed</p>
          ) : (
            <div className="mt-8 grid grid-cols-4 gap-3">
              {parts.map(([l, v]) => (
                <div key={l} className="rounded-xl border border-border bg-background/40 p-4 text-center">
                  <p className="font-mono text-4xl font-bold tabular-nums md:text-6xl">{String(v).padStart(2, "0")}</p>
                  <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{l}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="glass flex flex-col items-center justify-center p-6">
          <svg width="180" height="180" viewBox="0 0 180 180" className="-rotate-90">
            <circle cx="90" cy="90" r={r} stroke="var(--muted)" strokeWidth="14" fill="none" />
            <circle cx="90" cy="90" r={r} stroke="var(--primary)" strokeWidth="14" fill="none" strokeLinecap="round"
              strokeDasharray={c} strokeDashoffset={c - (c * pct) / 100} style={{ transition: "stroke-dashoffset 0.6s" }} />
          </svg>
          <p className="-mt-28 mb-20 font-display text-4xl font-bold">{pct}%</p>
          <p className="text-sm text-muted-foreground">Readiness (tasks + portfolio)</p>
        </div>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATUSES.map((s) => (
          <div key={s.id} className="glass p-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{s.name}</p>
            <p className="mt-2 font-display text-3xl font-bold">{data.tasks.filter((t) => t.status === s.id).length}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
