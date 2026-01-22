require('dotenv').config({ path: 'backend/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectData() {
    // 1. Check one row to see all available columns
    const { data: oneRow, error: rowError } = await supabase
        .from('incidents')
        .select('*')
        .limit(1);

    if (rowError) console.error("Row Error:", rowError);
    else console.log("🔍 Columns:", Object.keys(oneRow[0] || {}));

    // 2. Check topology values
    const { data: topoData, error: topoError } = await supabase
        .from('incidents')
        .select('topologia')
        .not('topologia', 'is', null)
        .limit(20);

    if (topoError) console.error("Topo Error:", topoError);
    else {
        const counts = {};
        topoData.forEach(i => counts[i.topologia] = (counts[i.topologia] || 0) + 1);
        console.log("📊 Topologies (Sample):", counts);
    }
}

inspectData();
