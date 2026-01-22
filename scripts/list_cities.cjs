require('dotenv').config({ path: 'backend/.env' });
const { createClient } = require('@supabase/supabase-js');

// Use VITE_ prefix as per .env
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function listCities() {
    const { data, error } = await supabase
        .from('incidents')
        .select('nm_cidade')
        .order('nm_cidade');

    if (error) {
        console.error(error);
        return;
    }

    const unique = [...new Set(data.map(i => i.nm_cidade))];
    console.log("🏙️ Cidades no Banco:");
    console.log(JSON.stringify(unique, null, 2));
}

listCities();
