
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wthzxrgifjtenaujhdbb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0aHp4cmdpZmp0ZW5hdWpoZGJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTAyNjA4MiwiZXhwIjoyMDg0NjAyMDgyfQ.xHrU6bILkEgkyN1NFdBzClIWzSW60EVo4cQvEsaxO58';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function setStatus() {
    const idMostra = 'INM00001521591';
    const newStatus = 'DESIGNADO';

    console.log(`Setting status of ${idMostra} to '${newStatus}'...`);

    // Get table ID
    const { data: incident } = await supabase
        .from('incidents')
        .select('id')
        .eq('id_mostra', idMostra)
        .single();

    if (!incident) {
        console.error("Incident not found.");
        return;
    }

    // Update
    const { error } = await supabase
        .from('incidents')
        .update({
            nm_status: newStatus,
            updated_at: new Date()
        })
        .eq('id', incident.id);

    if (error) {
        console.error("Update failed:", JSON.stringify(error, null, 2));
    } else {
        console.log("Update success!");
    }
}

setStatus();
