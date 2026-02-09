
-- Allow public (anon) read access to incidents
-- This is necessary if the frontend user is not correctly authenticated via Supabase Auth,
-- or if the Dashboard is intended to be public-facing.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT * FROM pg_policies 
        WHERE tablename = 'incidents' 
        AND policyname = 'Public users can view incidents'
    ) THEN
        create policy "Public users can view incidents"
        on public.incidents for select
        to anon
        using ( true );
    END IF;
END $$;
