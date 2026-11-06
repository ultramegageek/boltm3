import { useEffect, useState } from "react";
import { EVENTS, OTHER_EVENTS, readiness, STATUSES } from "@/lib/ftc";
import { cn } from "@/lib/utils";
import { SectionTitle, type WsProps } from "./shared";

type Ev = { id: string; name: string; date: string };
const ALL: Ev[] = [...EVENTS, ...OTHER_EVENTS];
const fmt = (d: string) =>
  new Date(d).toLocaleString(undefined, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

export function Overview({ data }: WsProps) {
  const [eventId, setEventId] = useState<string>(
    () => EVENTS.find((e) => new Date(e.date).getTime() > Date.now())?.id ?? "worlds",
  );
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const ev = ALL.find((e) => e.id === eventId)!;
  const isOther = OTHER_EVENTS.some((e) => e.id === eventId);
  const diff = Math.max(0, new Date(ev.date).getTime() - now);
  const parts = [
    ["Days", Math.floor(diff / 86400000)],
    ["Hrs", Math.floor(diff / 3600000) % 24],
    ["Min", Math.floor(diff / 60000) % 60],
    ["Sec", Math.floor(diff / 1000) % 60],
  ] as const;
  const pct = readiness(data.tasks, data.pages);

  const List = ({ title, items }: { title: string; items: readonly Ev[] }) => (
    <div>
      <p className="mb-2 border-b border-border pb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
      <ul>
        {items.map((e) => {
          const past = new Date(e.date).getTime() < now;
          return (
            <li key={e.id}>
              <button onClick={() => setEventId(e.id)}
                className={cn("flex w-full items-baseline justify-between gap-3 border-l-2 py-2 pl-3 pr-1 text-left text-sm transition",
                  e.id === eventId ? "border-primary bg-primary/10 text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
                  past && "opacity-40")}>
                <span className="truncate">{e.name}</span>
                <span className="shrink-0 font-mono text-xs">{fmt(e.date)}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <div>
      <SectionTitle title="Overview" sub="Countdown and team readiness" />
      <div className="grid gap-px overflow-hidden rounded-md border border-border bg-border lg:grid-cols-3">
        <div className="bg-background p-6 lg:col-span-2">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
            {isOther ? "Other event" : "FTC competition"} · {fmt(ev.date)} GMT+5
          </p>
          <h2 className="mt-2 text-2xl font-bold md:text-3xl">{ev.name}</h2>
          {diff === 0 ? (
            <p className="mt-10 text-4xl font-bold text-primary">Event day / completed</p>
          ) : (
            <div className="mt-8 flex flex-wrap items-end gap-x-8 gap-y-4">
              {parts.map(([l, v], i) => (
                <div key={l}>
                  <p className={cn("font-mono text-5xl font-bold tabular-nums leading-none md:text-7xl", i === 0 && "text-primary")}>
                    {String(v).padStart(2, "0")}
                  </p>
                  <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{l}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col justify-between bg-background p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Readiness</p>
          <p className="my-6 font-display text-7xl font-bold leading-none">{pct}<span className="text-primary">%</span></p>
          <div className="h-2 w-full bg-muted">
            <div className="h-full bg-primary transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Tasks 60% · Portfolio 40%</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 rounded-md border border-border bg-background p-6 md:grid-cols-2">
        <List title="FTC events" items={EVENTS} />
        <List title="Other events" items={OTHER_EVENTS} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border lg:grid-cols-4">
        {STATUSES.map((s) => (
          <div key={s.id} className="bg-background p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{s.name}</p>
            <p className={cn("mt-2 font-display text-4xl font-bold", s.id === "done" && "text-primary")}>
              {data.tasks.filter((t) => t.status === s.id).length}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
