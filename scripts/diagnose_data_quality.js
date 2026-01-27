
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wthzxrgifjtenaujhdbb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0aHp4cmdpZmp0ZW5hdWpoZGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMjYwODIsImV4cCI6MjA4NDYwMjA4Mn0.MGhDMxfbbKGc69Mut8M7ESmULS8d10VgeIu_vXcorpc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkDataQuality() {
    console.log("--- QUALITY CHECK ---");

    // 1. Check if dates are populated
    const { data: tempoData, error: errTempo } = await supabase.from('dim_tempo_operacional').select('*').limit(5);

    if (tempoData && tempoData.length > 0) {
        console.log("Amostra de Tempos (5 linhas):");
        tempoData.forEach((row, i) => {
            console.log(`[${i}] dt_prim_acionamento_fo:`, row.dt_primeiro_acionamento_fo);
            console.log(`    dt_chegada_cop_fo:`, row.dt_inicio_chegou_cop_fo);
            console.log(`    dt_prim_acionamento_gpon:`, row.dt_primeiro_acionamento_gpon);
        });
    } else {
        console.log("Tabela dim_tempo_operacional VAZIA ou inacessível.", errTempo);
    }

    // 2. Check operational nature match
    const { data: opData } = await supabase.from('dim_operacional').select('natureza, sintoma').limit(5);
    console.log("Amostra Operacional:", opData);

    // 3. Check Join integrity
    const { count } = await supabase.from('view_indicador_etit_hfc').select('*', { count: 'exact', head: true });
    console.log("Linhas na VIEW ETIT HFC:", count);
}

checkDataQuality();
