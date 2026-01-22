-- Allow Anonymous (Public) access to Incidents for Dashboard viewing
-- Since the frontend uses Mock Auth for now, the connection is effectively 'anon'
-- This ensures the dashboard works without real Supabase Auth login

create policy "Public users can view incidents"
on public.incidents for select
to anon
using ( true );

-- Also for ingestion_logs if we want the logs panel to work publicly
create policy "Public users can view logs"
on public.ingestion_logs for select
to anon
using ( true );
