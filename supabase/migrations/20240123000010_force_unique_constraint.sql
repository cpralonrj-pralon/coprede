-- REPAIR SCRIPT 010: FORCE UNIQUE CONSTRAINT (With Deduplication)
-- Este script remove duplicatas ANTES de tentar criar a regra de unicidade.

do $$ 
begin
    -- 1. Remover duplicatas existentes (Mantendo apenas o registro mais recente)
    delete from public.fact_indicadores_residencial a
    using public.fact_indicadores_residencial b
    where a.id < b.id 
    and a.id_mostra = b.id_mostra;

    -- 2. Agora seguro: Adicionar a constraint UNIQUE
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

end $$;
