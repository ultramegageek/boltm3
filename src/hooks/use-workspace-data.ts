import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type T = Database["public"]["Tables"];
export type Profile = T["profiles"]["Row"];
export type Task = T["tasks"]["Row"];
export type Journal = T["journal_entries"]["Row"];
export type Match = T["matches"]["Row"];
export type PortfolioPage = T["portfolio_pages"]["Row"];
export type Workspace = T["workspaces"]["Row"];

export function useMyWorkspaces() {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const { data, error } = await supabase.from("workspaces").select("*").order("created_at");
      if (error) throw error;
      return data;
    },
  });
}

export function useMyProfile(userId: string) {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useWorkspaceData(wsId: string) {
  const qc = useQueryClient();

  const members = useQuery({
    queryKey: ["ws", wsId, "members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workspace_members")
        .select("user_id, profiles(*)")
        .eq("workspace_id", wsId);
      if (error) throw error;
      return data.map((m) => m.profiles).filter(Boolean) as Profile[];
    },
  });
  const tasks = useQuery({
    queryKey: ["ws", wsId, "tasks"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tasks").select("*").eq("workspace_id", wsId).order("created_at");
      if (error) throw error;
      return data;
    },
  });
  const journal = useQuery({
    queryKey: ["ws", wsId, "journal"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("workspace_id", wsId)
        .order("entry_date", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const matches = useQuery({
    queryKey: ["ws", wsId, "matches"],
    queryFn: async () => {
      const { data, error } = await supabase.from("matches").select("*").eq("workspace_id", wsId).order("created_at");
      if (error) throw error;
      return data;
    },
  });
  const pages = useQuery({
    queryKey: ["ws", wsId, "pages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portfolio_pages")
        .select("*")
        .eq("workspace_id", wsId)
        .order("page_number");
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const map: Record<string, string> = {
      tasks: "tasks",
      journal_entries: "journal",
      matches: "matches",
      portfolio_pages: "pages",
      workspace_members: "members",
    };
    let ch = supabase.channel(`ws-${wsId}-${Math.random().toString(36).slice(2)}`);
    for (const [table, key] of Object.entries(map)) {
      ch = ch.on(
        "postgres_changes",
        { event: "*", schema: "public", table, filter: `workspace_id=eq.${wsId}` },
        () => qc.invalidateQueries({ queryKey: ["ws", wsId, key] }),
      );
    }
    ch.subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [wsId, qc]);

  const refresh = (key: string) => qc.invalidateQueries({ queryKey: ["ws", wsId, key] });

  return {
    members: members.data ?? [],
    tasks: tasks.data ?? [],
    journal: journal.data ?? [],
    matches: matches.data ?? [],
    pages: pages.data ?? [],
    loading: members.isLoading || tasks.isLoading,
    refresh,
  };
}
