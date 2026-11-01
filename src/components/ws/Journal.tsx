import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { matchStats } from "@/lib/ftc";
import { MemberAvatar, SectionTitle, type WsProps } from "./shared";

export function Journal({ wsId, userId, data }: WsProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const { error } = await supabase.from("journal_entries").insert({ workspace_id: wsId, title, content, entry_date: date });
    if (error) return toast.error(error.message);
    setTitle(""); setContent(""); data.refresh("journal");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <div>
        <SectionTitle title="Engineering Journal" sub="Daily technical log" />
        <form onSubmit={add} className="glass space-y-3 p-5">
          <div className="flex gap-3">
            <Input placeholder="What did we work on?" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input type="date" className="w-44" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <Textarea rows={4} placeholder="Problem, iterations, results, next steps…" value={content} onChange={(e) => setContent(e.target.value)} />
          <div className="flex justify-end"><Button variant="hero" type="submit">Log entry</Button></div>
        </form>
        <div className="mt-4 space-y-3">
          {data.journal.map((j) => {
            const a = data.members.find((m) => m.id === j.author_id);
            return (
              <article key={j.id} className="glass p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <MemberAvatar p={a} />
                    <div>
                      <h3 className="font-semibold">{j.title}</h3>
                      <p className="text-xs text-muted-foreground">{a?.full_name ?? "Unknown"} · <span className="font-mono">{j.entry_date}</span></p>
                    </div>
                  </div>
                  {j.author_id === userId && (
                    <Button size="icon" variant="ghost" onClick={async () => { await supabase.from("journal_entries").delete().eq("id", j.id); data.refresh("journal"); }}><Trash2 /></Button>
                  )}
                </div>
                {j.content && <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">{j.content}</p>}
              </article>
            );
          })}
        </div>
      </div>
      <MatchScorer wsId={wsId} userId={userId} data={data} />
    </div>
  );
}

function MatchScorer({ wsId, data }: WsProps) {
  const [label, setLabel] = useState("");
  const [s, setS] = useState({ auto: 0, teleop: 0, endgame: 0 });
  const total = s.auto + s.teleop + s.endgame;
  const stats = matchStats(data.matches);

  async function save() {
    const { error } = await supabase.from("matches").insert({
      workspace_id: wsId, label: label || `Practice #${data.matches.length + 1}`,
      auto_score: s.auto, teleop_score: s.teleop, endgame_score: s.endgame,
    });
    if (error) return toast.error(error.message);
    setLabel(""); setS({ auto: 0, teleop: 0, endgame: 0 }); data.refresh("matches");
  }

  return (
    <div>
      <SectionTitle title="Match Scorer" sub="Practice runs" />
      <div className="glass space-y-4 p-5">
        <Input placeholder="Match label" value={label} onChange={(e) => setLabel(e.target.value)} />
        {(["auto", "teleop", "endgame"] as const).map((k) => (
          <div key={k} className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium capitalize">{k === "teleop" ? "TeleOp" : k}</span>
            <Input type="number" min={0} className="w-28 text-right font-mono" value={s[k]}
              onChange={(e) => setS({ ...s, [k]: Math.max(0, Number(e.target.value) || 0) })} />
          </div>
        ))}
        <div className="flex items-center justify-between border-t border-border pt-4">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="font-mono text-3xl font-bold text-primary">{total}</span>
        </div>
        <Button variant="hero" className="w-full" onClick={save}>Save match</Button>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="glass p-4"><p className="text-xs uppercase tracking-widest text-muted-foreground">High</p><p className="font-mono text-2xl font-bold">{stats.high}</p></div>
        <div className="glass p-4"><p className="text-xs uppercase tracking-widest text-muted-foreground">Average</p><p className="font-mono text-2xl font-bold">{stats.average}</p></div>
      </div>
      <div className="glass mt-4 divide-y divide-border">
        {[...data.matches].reverse().map((m) => (
          <div key={m.id} className="flex items-center justify-between px-4 py-2 text-sm">
            <span>{m.label}</span>
            <span className="font-mono text-muted-foreground">{m.auto_score}/{m.teleop_score}/{m.endgame_score} · <b className="text-foreground">{m.auto_score + m.teleop_score + m.endgame_score}</b></span>
          </div>
        ))}
      </div>
    </div>
  );
}
