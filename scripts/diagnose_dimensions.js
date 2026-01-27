
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wthzxrgifjtenaujhdbb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0aHp4cmdpZmp0ZW5hdWpoZGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMjYwODIsImV4cCI6MjA4NDYwMjA4Mn0.MGhDMxfbbKGc69Mut8M7ESmULS8d10VgeIu_vXcorpc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkDimensions() {
    console.log("--- DIAGNOSTICO DE DIMENSOES ---");

    // Check distinct Tecnologias
    const { data: tecData } = await supabase.from('dim_operacional').select('tecnologia');
    const technologies = [...new Set(tecData.map(i => i.tecnologia))];
    console.log("Tecnologias encontradas:", technologies);

    // Check distinct Natureza
    const { data: natData } = await supabase.from('dim_operacional').select('natureza');
    const naturezas = [...new Set(natData.map(i => i.natureza))];
    console.log("Naturezas encontradas:", naturezas);

    // Check distinct Sintomas
    const { data: sinData } = await supabase.from('dim_operacional').select('sintoma');
    const sintomas = [...new Set(sinData.map(i => i.sintoma))];
    console.log("Sintomas encontrados:", sintomas);

    // Check Fact Time Range
    const { data: timeData } = await supabase.from('fact_indicadores_residencial').select('dt_inicio').order('dt_inicio', { ascending: true }).limit(1);
    const { data: timeDataEnd } = await supabase.from('fact_indicadores_residencial').select('dt_inicio').order('dt_inicio', { ascending: false }).limit(1);

    console.log("Range de Datas (Fato):");
    console.log("Min:", timeData?.[0]?.dt_inicio);
    console.log("Max:", timeDataEnd?.[0]?.dt_inicio);
}

checkDimensions();
