import { MemberAvatar, SectionTitle, type WsProps } from "./shared";

export function Roster({ data, inviteCode }: WsProps & { inviteCode: string }) {
  return (
    <div>
      <SectionTitle title="Member Roster" sub="Roles and workload"
        action={<div className="glass px-4 py-2 text-sm">Invite code: <span className="font-mono font-bold text-primary">{inviteCode}</span></div>} />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {data.members.map((m) => {
          const mine = data.tasks.filter((t) => t.assignee_id === m.id);
          const open = mine.filter((t) => t.status !== "done").length;
          const pages = data.pages.filter((p) => p.assignee_id === m.id).length;
          return (
            <div key={m.id} className="glass flex items-center gap-4 p-5">
              <MemberAvatar p={m} className="size-12" />
              <div className="flex-1">
                <p className="font-semibold">{m.full_name}</p>
                <p className="text-xs uppercase tracking-widest text-primary">{m.team_role}</p>
              </div>
              <div className="text-right font-mono text-xs text-muted-foreground">
                <p><b className="text-foreground">{open}</b> open</p>
                <p>{mine.length - open} done</p>
                <p>{pages} pages</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
