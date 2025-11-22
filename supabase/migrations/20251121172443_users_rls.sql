ALTER TABLE
    public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view user profiles" ON public.users;

CREATE POLICY "Anyone can view user profiles" ON public.users FOR
SELECT
    TO public USING (true);

DROP POLICY IF EXISTS "Users must update their own profile" ON public.users;

CREATE POLICY "Users must update their own profile" ON public.users FOR
UPDATE
    TO authenticated USING (auth.jwt() ->> 'sub' = id) WITH CHECK (auth.jwt() ->> 'sub' = id);