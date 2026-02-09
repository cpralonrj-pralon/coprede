
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wthzxrgifjtenaujhdbb.supabase.co';
// Using the key found in scripts/diagnose_ingestion.js
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0aHp4cmdpZmp0ZW5hdWpoZGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMjYwODIsImV4cCI6MjA4NDYwMjA4Mn0.MGhDMxfbbKGc69Mut8M7ESmULS8d10VgeIu_vXcorpc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function debugIncident(idMostra) {
    console.log(`--- DEBUGGING INCIDENT: ${idMostra} ---`);

    // 1. Fetch Incident
    // Note: Use text filtering if id_mostra is text, or clean it.
    // The user input has #, db id_mostra usually doesn't or does? Frontend shows #INM...
    // Let's try matching with and without #

    let queryId = idMostra.replace('#', '');

    const { data: incidents, error: incError } = await supabase
        .from('incidents')
        .select('*')
        .ilike('id_mostra', `%${queryId}%`);

    if (incError) {
        console.error("Error fetching incident:", incError);
        return;
    }

    if (!incidents || incidents.length === 0) {
        console.log("No incident found!");
        return;
    }

    const incident = incidents[0];
    console.log("Found Incident:", {
        id: incident.id,
        id_mostra: incident.id_mostra,
        status: incident.nm_status,
        org: incident.nm_organizacao_tratamento,
        group: incident.nm_grupo_tratamento,
        updated_at: incident.updated_at,
        created_at: incident.created_at
    });

    // 2. Fetch History
    const { data: history, error: histError } = await supabase
        .from('incident_history')
        .select('*')
        .eq('incident_id', incident.id)
        .order('alterado_em', { ascending: false });

    if (histError) {
        console.error("Error fetching history:", histError);
        return;
    }

    console.log(`\nHistory Entries Found: ${history.length}`);
    if (history.length > 0) {
        console.table(history.map(h => ({
            field: h.campo_alterado,
            old: h.valor_anterior, // This is the column we fixed
            new: h.valor_novo,
            who: h.alterado_por,
            when: h.alterado_em
        })));
    } else {
        console.log(">> NO HISTORY RECORDS FOUND <<");
        console.log("Possible causes:");
        console.log("1. No updates have happened since the fix.");
        console.log("2. Updates are happening but values are identical (ignored).");
        console.log("3. Trigger is not firing.");
    }

    // 3. Test Trigger (Optional - Simulate update)
    // We won't do this automatically to avoid messing with data, 
    // but we can check if updated_at is recent.
    const lastUpdate = new Date(incident.updated_at);
    const now = new Date();
    const diffSeconds = (now - lastUpdate) / 1000;
    console.log(`\nLast Update was ${diffSeconds.toFixed(0)} seconds ago.`);
}

debugIncident('INM00001521591');
