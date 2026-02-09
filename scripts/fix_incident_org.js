
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wthzxrgifjtenaujhdbb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0aHp4cmdpZmp0ZW5hdWpoZGJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTAyNjA4MiwiZXhwIjoyMDg0NjAyMDgyfQ.xHrU6bILkEgkyN1NFdBzClIWzSW60EVo4cQvEsaxO58';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function fixOrgData() {
    const idMostra = 'INM00001521614';
    console.log(`Updating data for: ${idMostra}`);

    const updates = {
        nm_organizacao_tratamento: "COPREDE_RJO_GRANDE_RIO",
        nm_grupo_tratamento: "COP REDE RF",
        updated_at: new Date()
    };

    // Get ID
    const { data: incident } = await supabase
        .from('incidents')
        .select('id')
        .eq('id_mostra', idMostra)
        .single();

    if (!incident) {
        console.error("Incident not found.");
        return;
    }

    const { error } = await supabase
        .from('incidents')
        .update(updates)
        .eq('id', incident.id);

    if (error) {
        console.error("Update failed:", error);
    } else {
        console.log("Update SUCCESS! Data populated.");
    }
}

fixOrgData();
