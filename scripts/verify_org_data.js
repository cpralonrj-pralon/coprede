
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wthzxrgifjtenaujhdbb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0aHp4cmdpZmp0ZW5hdWpoZGJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTAyNjA4MiwiZXhwIjoyMDg0NjAyMDgyfQ.xHrU6bILkEgkyN1NFdBzClIWzSW60EVo4cQvEsaxO58';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function verifyOrgData() {
    const idMostra = 'INM00001521614';
    console.log(`Checking data for incident: ${idMostra}`);

    const { data: incident, error } = await supabase
        .from('incidents')
        .select('*')
        .eq('id_mostra', idMostra)
        .single();

    if (error) {
        console.error("Error fetching incident:", error);
        return;
    }

    if (incident) {
        console.log("--- Incident Data ---");
        console.log("nm_organizacao_tratamento:", incident.nm_organizacao_tratamento);
        console.log("nm_area_responsavel:", incident.nm_area_responsavel);
        console.log("grupo:", incident.grupo);
        console.log("nm_grupo_tratamento:", incident.nm_grupo_tratamento);
        console.log("nm_status:", incident.nm_status);
        console.log("---------------------");
    } else {
        console.log("Incident not found.");
    }
}

verifyOrgData();
