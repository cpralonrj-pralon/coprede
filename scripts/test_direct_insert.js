
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wthzxrgifjtenaujhdbb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0aHp4cmdpZmp0ZW5hdWpoZGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMjYwODIsImV4cCI6MjA4NDYwMjA4Mn0.MGhDMxfbbKGc69Mut8M7ESmULS8d10VgeIu_vXcorpc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testDirect() {
    console.log("--- TESTE INSERÇÃO DIRETA ---");

    const payload = {
        id_mostra: "TEST_DIRECT_" + Date.now(),
        indicador_nome: 'Direct Test',
        indicador_valor: 99,
        volume: 1,
        anomes: 202501,
        // Using existing IDs or nulls if allowed?
        // Fact usually needs foreign keys for localidade/operacional.
        // Let's rely on null if allowed, or we must fetch/create them.
        localidade_id: null,
        operacional_id: null,
        tempo_operacional_id: null
    };

    console.log("Inserindo:", payload);

    const { data, error } = await supabase.from('fact_indicadores_residencial').insert([payload]).select();

    if (error) {
        console.error("❌ ERRO INSERT:", error);
    } else {
        console.log("✅ SUCESSO!", data);
    }
}

testDirect();
