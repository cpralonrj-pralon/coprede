
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wthzxrgifjtenaujhdbb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0aHp4cmdpZmp0ZW5hdWpoZGJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTAyNjA4MiwiZXhwIjoyMDg0NjAyMDgyfQ.xHrU6bILkEgkyN1NFdBzClIWzSW60EVo4cQvEsaxO58';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testInsert() {
    console.log("Attempting direct insert into incident_history...");
    const idMostra = 'INM00001521591'; // Use the known incident

    // Get ID
    const { data: incidents } = await supabase
        .from('incidents')
        .select('id')
        .eq('id_mostra', idMostra)
        .single();

    if (!incidents) {
        console.error("Incident not found.");
        return;
    }

    const { error } = await supabase
        .from('incident_history')
        .insert({
            incident_id: incidents.id,
            campo_alterado: 'TEST_MANUAL_INSERT',
            valor_anterior: 'TEST_A',
            valor_novo: 'TEST_B',
            alterado_por: 'system_debug',
            alterado_em: new Date()
        });

    if (error) {
        console.error("Manual Insert Failed:", error);
    } else {
        console.log("Manual Insert SUCCESS. Table is writable.");
    }
}

testInsert();
