import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Zap, LogOut, LayoutDashboard, Trophy, KanbanSquare, BookOpen, FileText, Users, UserCog } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useMyProfile, useMyWorkspaces, useWorkspaceData, type Profile } from "@/hooks/use-workspace-data";
import { TEAM_ROLES } from "@/lib/ftc";
import { cn } from "@/lib/utils";
import { Field, MemberAvatar } from "@/components/ws/shared";
import { Overview } from "@/components/ws/Overview";
import { Awards } from "@/components/ws/Awards";
import { Board } from "@/components/ws/Board";
import { Journal } from "@/components/ws/Journal";
import { Portfolio } from "@/components/ws/Portfolio";
import { Roster } from "@/components/ws/Roster";

export const Route = createFileRoute("/_authenticated/app")({
  head: () => ({
    meta: [
      { title: "Workspace — bolt.m3" },
      { name: "description", content: "bolt.m3 team workspace: awards, tasks, journal and portfolio." },
      { property: "og:title", content: "Workspace — bolt.m3" },
      { property: "og:description", content: "bolt.m3 team workspace." },
    ],
  }),
  component: AppPage,
});

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "awards", label: "Awards", icon: Trophy },
  { id: "board", label: "Board", icon: KanbanSquare },
  { id: "journal", label: "Journal & Matches", icon: BookOpen },
  { id: "portfolio", label: "Portfolio", icon: FileText },
  { id: "roster", label: "Roster", icon: Users },
] as const;

function AppPage() {
  const { user } = Route.useRouteContext();
  const ws = useMyWorkspaces();
  const profile = useMyProfile(user.id);
  const [wsId, setWsId] = useState<string | null>(null);

  useEffect(() => {
    if (!ws.data?.length) return;
    const saved = localStorage.getItem("bolt-ws");
    setWsId((cur) => cur && ws.data!.some((w) => w.id === cur) ? cur : ws.data!.find((w) => w.id === saved)?.id ?? ws.data![0].id);
  }, [ws.data]);

  if (ws.isLoading) return <div className="grid min-h-screen place-items-center text-muted-foreground">Loading…</div>;
  if (!ws.data?.length || !wsId) return <Onboarding onDone={(id) => { localStorage.setItem("bolt-ws", id); setWsId(id); ws.refetch(); }} />;

  return (
    <Workspace
      key={wsId}
      wsId={wsId}
      userId={user.id}
      profile={profile.data ?? null}
      workspaces={ws.data}
      onSwitch={(id) => { localStorage.setItem("bolt-ws", id); setWsId(id); }}
      onNew={() => setWsId(null)}
    />
  );
}

function Workspace({ wsId, userId, profile, workspaces, onSwitch, onNew }: {
  wsId: string; userId: string; profile: Profile | null;
  workspaces: { id: string; name: string; invite_code: string }[];
  onSwitch: (id: string) => void; onNew: () => void;
}) {
  const data = useWorkspaceData(wsId);
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("overview");
  const [editProfile, setEditProfile] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const current = workspaces.find((w) => w.id === wsId)!;
  const props = { wsId, userId, data };

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          <div className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="grid size-8 place-items-center rounded-lg bg-gradient-primary shadow-glow"><Zap className="size-4" /></span>
            bolt<span className="text-primary">.m3</span>
          </div>
          <div className="hidden w-56 sm:block">
            <Field value={wsId} onChange={(v) => (v === "__new" ? onNew() : onSwitch(v))}
              options={[...workspaces.map((w) => [w.id, w.name] as [string, string]), ["__new", "+ Create / join…"]]} />
          </div>
          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-3 hover:border-primary/50">
                  <MemberAvatar p={profile} />
                  <span className="text-left leading-tight">
                    <span className="block text-sm font-medium">{profile?.full_name}</span>
                    <span className="block text-[10px] uppercase tracking-widest text-primary">{profile?.team_role}</span>
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{current.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setEditProfile(true)}><UserCog /> Edit profile</DropdownMenuItem>
                <DropdownMenuItem onClick={signOut}><LogOut /> Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-2">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn("flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition",
                tab === t.id ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground")}>
              <t.icon className="size-4" /> {t.label}
            </button>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">
        {tab === "overview" && <Overview {...props} />}
        {tab === "awards" && <Awards {...props} />}
        {tab === "board" && <Board {...props} />}
        {tab === "journal" && <Journal {...props} />}
        {tab === "portfolio" && <Portfolio {...props} />}
        {tab === "roster" && <Roster {...props} inviteCode={current.invite_code} />}
      </main>
      {profile && <ProfileDialog open={editProfile} onOpenChange={setEditProfile} profile={profile} />}
    </div>
  );
}

function ProfileDialog({ open, onOpenChange, profile }: { open: boolean; onOpenChange: (o: boolean) => void; profile: Profile }) {
  const qc = useQueryClient();
  const [name, setName] = useState(profile.full_name);
  const [role, setRole] = useState(profile.team_role);
  const [avatar, setAvatar] = useState(profile.avatar_url ?? "");
  async function save() {
    const { error } = await supabase.from("profiles").update({ full_name: name, team_role: role, avatar_url: avatar || null }).eq("id", profile.id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries();
    onOpenChange(false);
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Your profile</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <Field label="Team role" value={role} onChange={setRole} options={TEAM_ROLES.map((r) => [r, r])} />
          <div className="space-y-1.5"><Label>Avatar image URL</Label><Input value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="https://…" /></div>
          <Button variant="hero" className="w-full" onClick={save}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Onboarding({ onDone }: { onDone: (id: string) => void }) {
  const [name, setName] = useState("bolt.m3 Workspace");
  const [code, setCode] = useState("");
  async function create() {
    const { data, error } = await supabase.rpc("create_workspace", { _name: name });
    if (error) return toast.error(error.message);
    onDone(data as string);
  }
  async function join() {
    const { data, error } = await supabase.rpc("join_workspace", { _code: code });
    if (error) return toast.error(error.message);
    onDone(data as string);
  }
  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-3xl">
        <h1 className="text-center text-4xl font-bold">Set up your <span className="text-gradient">workspace</span></h1>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="glass space-y-4 p-6">
            <h2 className="text-lg font-semibold">Create a workspace</h2>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
            <Button variant="hero" className="w-full" onClick={create}>Create</Button>
          </div>
          <div className="glass space-y-4 p-6">
            <h2 className="text-lg font-semibold">Join with invite code</h2>
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. A1B2C3" className="font-mono uppercase" />
            <Button variant="outline" className="w-full" onClick={join}>Join</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
