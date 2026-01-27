
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wthzxrgifjtenaujhdbb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0aHp4cmdpZmp0ZW5hdWpoZGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMjYwODIsImV4cCI6MjA4NDYwMjA4Mn0.MGhDMxfbbKGc69Mut8M7ESmULS8d10VgeIu_vXcorpc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testRpc() {
    console.log("--- TESTANDO RPC ---");

    const payload = {
        p_id_mostra: "TEST_RPC_" + Date.now(),
        p_regional: "TEST_REGIONAL",
        p_grupo: "TEST_GRUPO",
        p_cidade_uf: "TestCity/TS",
        p_uf: "TS",

        p_tecnologia: "HFC",
        p_servico: "Internet",
        p_natureza: "Emergencial",
        p_sintoma: "Sintoma X",
        p_ferramenta: "SGO",
        p_fechamento: "Fechado auto",
        p_solucao: "Troca eqp",

        p_timestamps: {
            dt_inicio: new Date().toISOString(),
            dt_fim: new Date().toISOString(),
            dt_em_progresso: null
        },
        p_metrics: {
            indicador_nome: 'Analytics Test',
            indicador_valor: 100,
            volume: 1,
            anomes: 202501,
            indicador_status: 'ADERENTE',
            impacto: 'Alto'
        }
    };

    console.log("Enviando Payload:", JSON.stringify(payload, null, 2));

    const { data, error } = await supabase.rpc('ingest_flat_indicador', payload);

    if (error) {
        console.error("❌ ERRO RPC:", error);
    } else {
        console.log("✅ SUCESSO! RPC executada sem erro.");

        // Check if inserted
        const { data: check } = await supabase.from('fact_indicadores_residencial').select('*').eq('id_mostra', payload.p_id_mostra);
        console.log("Verificação no Banco:", check);
    }
}

testRpc();
