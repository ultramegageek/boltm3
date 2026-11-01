import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AWARDS, STATUSES } from "@/lib/ftc";
import { cn } from "@/lib/utils";
import { MemberAvatar, SectionTitle, StatusPill, TaskDialog, type WsProps } from "./shared";

export function Awards({ wsId, data }: WsProps) {
  const [active, setActive] = useState<string>(AWARDS[0].id);
  const award = AWARDS.find((a) => a.id === active)!;
  const tasks = data.tasks.filter((t) => t.award === active);
  const done = tasks.filter((t) => t.status === "done").length;

  return (
    <div>
      <SectionTitle title="Awards" sub="Requirements and owners for every FTC award" />
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <div className="glass flex gap-1 overflow-x-auto p-2 lg:flex-col">
          {AWARDS.map((a) => {
            const at = data.tasks.filter((t) => t.award === a.id);
            const d = at.filter((t) => t.status === "done").length;
            return (
              <button key={a.id} onClick={() => setActive(a.id)}
                className={cn("flex shrink-0 items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition",
                  active === a.id ? "bg-primary text-primary-foreground" : "hover:bg-accent")}>
                <span>{a.name}{"optional" in a && <span className="ml-1 opacity-60">(opt)</span>}</span>
                <span className="font-mono text-xs opacity-80">{d}/{at.length}</span>
              </button>
            );
          })}
        </div>
        <div className="glass p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-xl font-semibold">{award.name}</h3>
            <TaskDialog key={active} wsId={wsId} members={data.members} defaultAward={active}
              trigger={<Button variant="hero" size="sm"><Plus /> Add requirement</Button>} />
          </div>
          <Progress value={tasks.length ? (done / tasks.length) * 100 : 0} className="mt-4 h-2" />
          <p className="mt-1 text-xs text-muted-foreground">{done} of {tasks.length} complete</p>
          <div className="mt-6 space-y-2">
            {tasks.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">No requirements yet. Add the first one.</p>}
            {tasks.map((t) => (
              <TaskDialog key={t.id} wsId={wsId} members={data.members} task={t}
                trigger={
                  <button className="flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-background/40 px-4 py-3 text-left hover:border-primary/50">
                    <div>
                      <p className="font-medium">{t.title}</p>
                      {t.description && <p className="line-clamp-1 text-xs text-muted-foreground">{t.description}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusPill status={t.status} label={STATUSES.find((s) => s.id === t.status)?.name ?? t.status} />
                      <MemberAvatar p={data.members.find((m) => m.id === t.assignee_id)} />
                    </div>
                  </button>
                } />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
