
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wthzxrgifjtenaujhdbb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0aHp4cmdpZmp0ZW5hdWpoZGJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTAyNjA4MiwiZXhwIjoyMDg0NjAyMDgyfQ.xHrU6bILkEgkyN1NFdBzClIWzSW60EVo4cQvEsaxO58';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkIncidentsSchema() {
    console.log("Checking 'incidents' table columns...");
    const { data: cols, error: errCols } = await supabase
        .from('incidents')
        .select('*')
        .limit(1);

    if (errCols) {
        console.error("Error fetching incidents:", errCols);
        return;
    }

    if (cols && cols.length > 0) {
        const keys = Object.keys(cols[0]);
        console.log("Keys in incidents:", keys);
    } else {
        console.log("incidents table exists but is empty/no rows returned.");
    }
}

checkIncidentsSchema();
