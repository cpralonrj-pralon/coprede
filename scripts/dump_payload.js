
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wthzxrgifjtenaujhdbb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0aHp4cmdpZmp0ZW5hdWpoZGJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTAyNjA4MiwiZXhwIjoyMDg0NjAyMDgyfQ.xHrU6bILkEgkyN1NFdBzClIWzSW60EVo4cQvEsaxO58';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkPayload() {
    const idMostra = 'INM00001521614';
    console.log(`Checking payload for: ${idMostra}`);

    const { data: incident, error } = await supabase
        .from('incidents')
        .select('payload')
        .eq('id_mostra', idMostra)
        .single();

    if (error) {
        console.error("Error:", error);
    } else {
        console.log("PAYLOAD START");
        console.log(JSON.stringify(incident.payload, null, 2));
        console.log("PAYLOAD END");
    }
}

checkPayload();
