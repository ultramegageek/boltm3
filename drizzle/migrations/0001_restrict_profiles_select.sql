DROP POLICY IF EXISTS "profiles readable" ON public.profiles;
CREATE POLICY "profiles readable by self or teammates" ON public.profiles
FOR SELECT TO authenticated
USING (
  auth.uid() = id OR EXISTS (
    SELECT 1 FROM public.workspace_members m
    WHERE m.user_id = profiles.id AND public.is_member(m.workspace_id)
  )
);