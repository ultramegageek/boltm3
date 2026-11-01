import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AWARDS, CATEGORIES, STATUSES, initials } from "@/lib/ftc";
import type { Profile, Task, useWorkspaceData } from "@/hooks/use-workspace-data";
import { cn } from "@/lib/utils";

export type WsData = ReturnType<typeof useWorkspaceData>;
export type WsProps = { wsId: string; userId: string; data: WsData };

export function MemberAvatar({ p, className }: { p?: Profile | null; className?: string }) {
  return (
    <Avatar className={cn("size-7 border border-border", className)} title={p?.full_name}>
      {p?.avatar_url && <AvatarImage src={p.avatar_url} />}
      <AvatarFallback className="bg-accent text-[10px] font-semibold text-accent-foreground">
        {initials(p?.full_name)}
      </AvatarFallback>
    </Avatar>
  );
}

export function SectionTitle({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-2xl font-bold">{title}</h2>
        {sub && <p className="text-sm text-muted-foreground">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

const NONE = "__none";

export function TaskDialog({
  wsId,
  members,
  task,
  defaultAward,
  trigger,
}: {
  wsId: string;
  members: Profile[];
  task?: Task;
  defaultAward?: string | null;
  trigger: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [status, setStatus] = useState(task?.status ?? "todo");
  const [category, setCategory] = useState(task?.category ?? "Portfolio");
  const [award, setAward] = useState(task?.award ?? defaultAward ?? NONE);
  const [assignee, setAssignee] = useState(task?.assignee_id ?? NONE);

  async function save() {
    if (!title.trim()) return toast.error("Title required");
    const row = {
      title: title.trim(),
      description,
      status,
      category,
      award: award === NONE ? null : award,
      assignee_id: assignee === NONE ? null : assignee,
    };
    const { error } = task
      ? await supabase.from("tasks").update(row).eq("id", task.id)
      : await supabase.from("tasks").insert({ ...row, workspace_id: wsId });
    if (error) return toast.error(error.message);
    setOpen(false);
    if (!task) {
      setTitle("");
      setDescription("");
    }
  }

  async function remove() {
    if (!task) return;
    const { error } = await supabase.from("tasks").delete().eq("id", task.id);
    if (error) return toast.error(error.message);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task ? "Edit task" : "New task"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5"><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Details</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Status" value={status} onChange={setStatus} options={STATUSES.map((s) => [s.id, s.name])} />
            <Field label="Category" value={category} onChange={setCategory} options={CATEGORIES.map((c) => [c, c])} />
            <Field label="Award" value={award} onChange={setAward} options={[[NONE, "None"], ...AWARDS.map((a) => [a.id, a.name] as [string, string])]} />
            <Field label="Assignee" value={assignee} onChange={setAssignee} options={[[NONE, "Unassigned"], ...members.map((m) => [m.id, m.full_name] as [string, string])]} />
          </div>
          <div className="flex justify-between gap-2">
            {task ? <Button variant="ghost" onClick={remove}>Delete</Button> : <span />}
            <Button variant="hero" onClick={save}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function Field({
  label,
  value,
  onChange,
  options,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  options: (readonly [string, string] | [string, string])[];
}) {
  return (
    <div className="space-y-1.5">
      {label && <Label>{label}</Label>}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

const STATUS_STYLE: Record<string, string> = {
  todo: "bg-muted text-muted-foreground",
  in_progress: "bg-info/15 text-info",
  review: "bg-warning/15 text-warning",
  done: "bg-success/15 text-success",
  not_started: "bg-muted text-muted-foreground",
  ready: "bg-success/15 text-success",
};

export function StatusPill({ status, label }: { status: string; label: string }) {
  return <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", STATUS_STYLE[status])}>{label}</span>;
}

export function TaskCard({ t, data, wsId }: { t: Task; data: WsData; wsId: string }) {
  const assignee = data.members.find((m) => m.id === t.assignee_id);
  const award = AWARDS.find((a) => a.id === t.award);
  return (
    <TaskDialog
      wsId={wsId}
      members={data.members}
      task={t}
      trigger={
        <button className="glass w-full p-3 text-left transition hover:border-primary/50">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium">{t.title}</p>
            <MemberAvatar p={assignee} className="size-6" />
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="rounded bg-primary/15 px-1.5 py-0.5 font-mono text-[10px] uppercase text-primary">{t.category}</span>
            {award && <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-secondary-foreground">{award.name.replace(/ Award.*/, "")}</span>}
          </div>
        </button>
      }
    />
  );
}
