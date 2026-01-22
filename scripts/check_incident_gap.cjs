require('dotenv').config({ path: 'backend/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkIncident() {
    const id = 'INM00001443065';
    console.log(`Checking Incident: ${id}`);

    const { data, error } = await supabase
        .from('incidents')
        .select('id_mostra, topologia, tp_topologia, nm_cidade')
        .eq('id_mostra', id)
        .maybeSingle();

    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Result:", data);
    }
}

checkIncident();
