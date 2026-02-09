
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wthzxrgifjtenaujhdbb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0aHp4cmdpZmp0ZW5hdWpoZGJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTAyNjA4MiwiZXhwIjoyMDg0NjAyMDgyfQ.xHrU6bILkEgkyN1NFdBzClIWzSW60EVo4cQvEsaxO58';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function forceUpdate() {
    const idMostra = 'INM00001521591';
    console.log(`--- FORCING UPDATE FOR: ${idMostra} ---`);

    // 1. Get current ID and Status
    const { data: incidents } = await supabase
        .from('incidents')
        .select('id, nm_status')
        .eq('id_mostra', idMostra)
        .single();

    if (!incidents) {
        console.error("Incident not found db.");
        return;
    }

    console.log(`Current Status: ${incidents.nm_status}`);

    // 2. Update to 'EM ANÁLISE'
    console.log("Updating to 'EM ANÁLISE'...");
    const { error: err1 } = await supabase
        .from('incidents')
        .update({ nm_status: 'EM ANÁLISE', updated_at: new Date() })
        .eq('id', incidents.id);

    if (err1) console.error("Update 1 failed:", err1);
    else console.log("Update 1 Success. Trigger should have fired.");

    // Wait 2 seconds
    await new Promise(r => setTimeout(r, 2000));

    // 3. Revert to 'PENDENTE' (or whatever it was)
    const originalStatus = incidents.nm_status;
    // If it was already em analise (unlikely given screenshot), we swap. 
    // Screenshot says PENDENTE.

    console.log(`Reverting to '${originalStatus}'...`);
    const { error: err2 } = await supabase
        .from('incidents')
        .update({ nm_status: originalStatus, updated_at: new Date() })
        .eq('id', incidents.id);

    if (err2) console.error("Update 2 failed:", err2);
    else console.log("Update 2 Success. Trigger should have fired.");

    console.log("Check the frontend now!");
}

forceUpdate();
