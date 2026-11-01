create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  team_role text not null default 'Member',
  avatar_url text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "profiles readable" on public.profiles for select to authenticated using (true);
create policy "own profile insert" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "own profile update" on public.profiles for update to authenticated using (auth.uid() = id);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, team_role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)), coalesce(new.raw_user_meta_data->>'team_role','Member'));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text not null unique default upper(substr(md5(random()::text),1,6)),
  created_by uuid not null,
  created_at timestamptz not null default now()
);
create table public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);
grant select, update on public.workspaces to authenticated;
grant all on public.workspaces to service_role;
grant select, delete on public.workspace_members to authenticated;
grant all on public.workspace_members to service_role;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;

create or replace function public.is_member(_ws uuid) returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.workspace_members where workspace_id = _ws and user_id = auth.uid())
$$;

create policy "members view ws" on public.workspaces for select to authenticated using (public.is_member(id));
create policy "members update ws" on public.workspaces for update to authenticated using (public.is_member(id));
create policy "members view members" on public.workspace_members for select to authenticated using (public.is_member(workspace_id));
create policy "leave ws" on public.workspace_members for delete to authenticated using (user_id = auth.uid());

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null,
  description text not null default '',
  status text not null default 'todo',
  category text not null default 'Portfolio',
  award text,
  assignee_id uuid references public.profiles(id) on delete set null,
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now()
);
create table public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  author_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  title text not null,
  content text not null default '',
  entry_date date not null default current_date,
  created_at timestamptz not null default now()
);
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  label text not null default 'Practice',
  auto_score int not null default 0,
  teleop_score int not null default 0,
  endgame_score int not null default 0,
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now()
);
create table public.portfolio_pages (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  page_number int not null,
  title text not null default '',
  status text not null default 'not_started',
  assignee_id uuid references public.profiles(id) on delete set null,
  unique (workspace_id, page_number)
);
grant select, insert, update, delete on public.tasks, public.journal_entries, public.matches, public.portfolio_pages to authenticated;
grant all on public.tasks, public.journal_entries, public.matches, public.portfolio_pages to service_role;
alter table public.tasks enable row level security;
alter table public.journal_entries enable row level security;
alter table public.matches enable row level security;
alter table public.portfolio_pages enable row level security;
create policy "ws tasks" on public.tasks for all to authenticated using (public.is_member(workspace_id)) with check (public.is_member(workspace_id));
create policy "ws journal" on public.journal_entries for all to authenticated using (public.is_member(workspace_id)) with check (public.is_member(workspace_id));
create policy "ws matches" on public.matches for all to authenticated using (public.is_member(workspace_id)) with check (public.is_member(workspace_id));
create policy "ws portfolio" on public.portfolio_pages for all to authenticated using (public.is_member(workspace_id)) with check (public.is_member(workspace_id));

create or replace function public.create_workspace(_name text) returns uuid language plpgsql security definer set search_path = public as $$
declare _id uuid; i int;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  insert into public.workspaces (name, created_by) values (_name, auth.uid()) returning id into _id;
  insert into public.workspace_members (workspace_id, user_id) values (_id, auth.uid());
  for i in 1..15 loop
    insert into public.portfolio_pages (workspace_id, page_number, title) values (_id, i,
      (array['Cover & Team Intro','Team Overview','Outreach & Reach','Connect: Industry','Sustainability Plan','Business Plan','Engineering Process','Robot Overview','Drivetrain','Intake & Scoring','Lift / Endgame','Software Architecture','Autonomous & Control','Testing & Iteration','Season Reflection'])[i]);
  end loop;
  return _id;
end $$;

create or replace function public.join_workspace(_code text) returns uuid language plpgsql security definer set search_path = public as $$
declare _id uuid;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  select id into _id from public.workspaces where invite_code = upper(trim(_code));
  if _id is null then raise exception 'Invalid invite code'; end if;
  insert into public.workspace_members (workspace_id, user_id) values (_id, auth.uid()) on conflict do nothing;
  return _id;
end $$;
revoke execute on function public.create_workspace(text), public.join_workspace(text) from anon, public;
grant execute on function public.create_workspace(text), public.join_workspace(text) to authenticated;

alter publication supabase_realtime add table public.tasks, public.journal_entries, public.matches, public.portfolio_pages, public.workspace_members;