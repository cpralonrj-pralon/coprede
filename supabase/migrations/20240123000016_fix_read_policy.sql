-- FIX DE PERMISSÕES DE LEITURA (Script 016)
-- Garante que o Dashboard (e scripts de teste) consigam LER os dados.
-- Se RLS estiver ativo sem essa política, os dados existem mas ninguém vê (contagem = 0).

-- 1. Fact Indicadores
ALTER TABLE "public"."fact_indicadores_residencial" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Fact" ON "public"."fact_indicadores_residencial";
CREATE POLICY "Public Read Fact" ON "public"."fact_indicadores_residencial"
FOR SELECT USING (true); -- Permite leitura pública (Dashboard)

-- 2. Dimensões (Necessário para Views funcionarem)
ALTER TABLE "public"."dim_localidade" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read DimLocalidade" ON "public"."dim_localidade";
CREATE POLICY "Public Read DimLocalidade" ON "public"."dim_localidade"
FOR SELECT USING (true);

ALTER TABLE "public"."dim_operacional" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read DimOperacional" ON "public"."dim_operacional";
CREATE POLICY "Public Read DimOperacional" ON "public"."dim_operacional"
FOR SELECT USING (true);

ALTER TABLE "public"."dim_tempo_operacional" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read DimTempo" ON "public"."dim_tempo_operacional";
CREATE POLICY "Public Read DimTempo" ON "public"."dim_tempo_operacional"
FOR SELECT USING (true);

-- 3. Grants para Anon/Authenticated (Backup)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
