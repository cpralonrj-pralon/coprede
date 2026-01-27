
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wthzxrgifjtenaujhdbb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0aHp4cmdpZmp0ZW5hdWpoZGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMjYwODIsImV4cCI6MjA4NDYwMjA4Mn0.MGhDMxfbbKGc69Mut8M7ESmULS8d10VgeIu_vXcorpc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkFullStats() {
    console.log("--- DIAGNOSTICO COMPLETO ---");

    // 1. Total Rows
    const { count: total } = await supabase.from('fact_indicadores_residencial').select('*', { count: 'exact', head: true });
    console.log(`TOTAL DE LINHAS: ${total}`);

    // 2. Dates Validity
    const { count: validDtInicio } = await supabase.from('fact_indicadores_residencial')
        .select('*', { count: 'exact', head: true })
        .not('dt_inicio', 'is', null);
    console.log(`Linhas com DATA INICIO valida: ${validDtInicio}`);

    // 3. Operational Timestamps Validity
    // Need to join via dim_tempo_operacional
    // We can just check the dim table directly since it's 1:1 usually
    const { count: validTempo } = await supabase.from('dim_tempo_operacional')
        .select('*', { count: 'exact', head: true })
        .not('dt_primeiro_acionamento_fo', 'is', null);

    const { count: validTempoGpon } = await supabase.from('dim_tempo_operacional')
        .select('*', { count: 'exact', head: true })
        .not('dt_primeiro_acionamento_gpon', 'is', null);

    console.log(`DimTempo com Acionamento FO: ${validTempo}`);
    console.log(`DimTempo com Acionamento GPON: ${validTempoGpon}`);

    // 4. View Results (Direct Query)
    const { data: viewHfc } = await supabase.from('view_indicador_etit_hfc').select('*');
    console.log("Conteudo View HFC:", viewHfc);

    // 5. Sample Raw Data
    if (total > 0) {
        const { data: sample } = await supabase.from('fact_indicadores_residencial')
            .select('dt_inicio, id_mostra, dim_tempo_operacional(dt_primeiro_acionamento_fo)')
            .limit(3);
        console.log("Amostra Raw:", JSON.stringify(sample, null, 2));
    }
}

checkFullStats();
