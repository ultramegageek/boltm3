import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CATEGORIES, STATUSES } from "@/lib/ftc";
import { cn } from "@/lib/utils";
import { Field, MemberAvatar, SectionTitle, TaskCard, TaskDialog, type WsProps } from "./shared";

export function Board({ wsId, data }: WsProps) {
  const [member, setMember] = useState("all");
  const [cat, setCat] = useState("all");
  const [over, setOver] = useState<string | null>(null);
  const tasks = data.tasks.filter(
    (t) => (member === "all" || t.assignee_id === member) && (cat === "all" || t.category === cat),
  );

  async function move(id: string, status: string) {
    const { error } = await supabase.from("tasks").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else data.refresh("tasks");
  }

  return (
    <div>
      <SectionTitle title="Task Board" sub="Drag cards between columns"
        action={
          <div className="flex flex-wrap items-end gap-2">
            <div className="w-44"><Field value={member} onChange={setMember} options={[["all", "All members"], ...data.members.map((m) => [m.id, m.full_name] as [string, string])]} /></div>
            <div className="w-40"><Field value={cat} onChange={setCat} options={[["all", "All categories"], ...CATEGORIES.map((c) => [c, c] as [string, string])]} /></div>
            <TaskDialog wsId={wsId} members={data.members} trigger={<Button variant="hero"><Plus /> Task</Button>} />
          </div>
        } />
      <div className="mb-4 flex flex-wrap gap-1">
        {data.members.map((m) => (
          <button key={m.id} onClick={() => setMember(member === m.id ? "all" : m.id)}
            className={cn("rounded-full ring-2 transition", member === m.id ? "ring-primary" : "ring-transparent opacity-80 hover:opacity-100")}>
            <MemberAvatar p={m} className="size-8" />
          </button>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {STATUSES.map((s) => {
          const col = tasks.filter((t) => t.status === s.id);
          return (
            <div key={s.id}
              onDragOver={(e) => { e.preventDefault(); setOver(s.id); }}
              onDragLeave={() => setOver(null)}
              onDrop={(e) => { setOver(null); move(e.dataTransfer.getData("text/plain"), s.id); }}
              className={cn("glass min-h-64 p-3 transition", over === s.id && "border-primary")}>
              <div className="mb-3 flex items-center justify-between px-1">
                <h3 className="font-semibold">{s.name}</h3>
                <span className="font-mono text-xs text-muted-foreground">{col.length}</span>
              </div>
              <div className="space-y-2">
                {col.map((t) => (
                  <div key={t.id} draggable onDragStart={(e) => e.dataTransfer.setData("text/plain", t.id)}>
                    <TaskCard t={t} data={data} wsId={wsId} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
