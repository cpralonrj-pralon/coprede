-- REPAIR SCRIPT 009: Fix ON CONFLICT Error
-- Adiciona a constraint UNIQUE na coluna id_mostra para permitir o UPSERT

do $$ 
begin
    -- 1. Verifica se a tabela existe
    if exists (select from information_schema.tables where table_name = 'fact_indicadores_residencial') then
        
        -- 2. Tenta adicionar a constraint UNIQUE se ela não existir
        -- Nota: O nome da constraint pode variar, então verificamos se JÁ EXISTE alguma constraint unique nessa coluna
        if not exists (
            select 1 
            from pg_constraint con 
            join pg_attribute attr on attr.attrelid = con.conrelid and attr.attnum = any(con.conkey)
            where con.contype = 'u' 
            and con.conrelid = 'public.fact_indicadores_residencial'::regclass
            and attr.attname = 'id_mostra'
        ) then
            alter table public.fact_indicadores_residencial add constraint fact_indicadores_id_mostra_unique unique (id_mostra);
        end if;
        
    end if;
end $$;
