
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wthzxrgifjtenaujhdbb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0aHp4cmdpZmp0ZW5hdWpoZGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMjYwODIsImV4cCI6MjA4NDYwMjA4Mn0.MGhDMxfbbKGc69Mut8M7ESmULS8d10VgeIu_vXcorpc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkStats() {
    console.log("--- DIAGNOSTICO DE DADOS ---");

    const { count: factCount, error: errFact } = await supabase.from('fact_indicadores_residencial').select('*', { count: 'exact', head: true });
    console.log(`Fatos (Indicadores): ${factCount} (Erro: ${errFact?.message || 'Nenhum'})`);

    const { count: dimLocal, error: errLoc } = await supabase.from('dim_localidade').select('*', { count: 'exact', head: true });
    console.log(`Dim Localidade: ${dimLocal} (Erro: ${errLoc?.message || 'Nenhum'})`);

    const { count: dimOp, error: errOp } = await supabase.from('dim_operacional').select('*', { count: 'exact', head: true });
    console.log(`Dim Operacional: ${dimOp} (Erro: ${errOp?.message || 'Nenhum'})`);

    // Check Sample Data
    if (factCount > 0) {
        const { data: sample } = await supabase.from('fact_indicadores_residencial').select('id_mostra, anomes, indicador_valor').limit(3);
        console.log("Amostra Fato:", sample);
    }

    // Check View output
    const { data: hfcView, error: errView } = await supabase.from('view_indicador_etit_hfc').select('*').limit(3);
    console.log(`View HFC (Amostra):`, hfcView);
    if (errView) console.log("Erro View HFC:", errView);

}

checkStats();
