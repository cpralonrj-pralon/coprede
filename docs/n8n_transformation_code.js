/**
 * Extrator de campos para COP REDE com filtros:
 *  - Regional = LESTE
 *  - EXCLUI ds_sumario que contenha "PROBLEMA DE SEGURANÇA PÚBLICA"
 *  - nm_tipo = EMERGENCIAL
 *  - nm_cat_prod2 = REDE OPTICA
 *  - nm_cat_prod3 contendo NODE ou GPON   << NOVO
 * Funciona com HTTP (json.data como string/array/obj) e itens achatados.
 * Mapeia por nomes e por índices numéricos. Limpa HTML do ds_sumario.
 */

// ==== Utils ====
function cleanHtml(str = '') {
    // remove tags HTML reais e também quando vierem escapadas (&lt;...&gt;)
    return String(str)
        .replace(/<[^>]*>?/gm, '')
        .replace(/&lt;[^&gt;]*&gt;?/gm, '')
        .trim();
}
function getFirst(...vals) {
    for (const v of vals) {
        if (v !== undefined && v !== null) return v;
    }
    return undefined;
}
function normalize(str = '') {
    return String(str)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .trim();
}

// ==== Carregar registros de entrada ====
const inItems = $input.all();
let records = [];

if (inItems.length > 0 && inItems[0].json && inItems[0].json.data !== undefined) {
    let raw = inItems[0].json.data;
    if (typeof raw === 'string') {
        try {
            records = JSON.parse(raw);
        } catch (e) {
            records = [];
        }
    } else if (Array.isArray(raw)) {
        records = raw;
    } else if (typeof raw === 'object') {
        records = [raw];
    }
} else {
    // Itens já achatados vindos de outros nós
    records = inItems.map(i => i.json || {});
}

if (!records || records.length === 0) {
    return [];
}

// ==== Função de mapeamento com fallbacks (nomes e índices) ====
function pickFields(src) {
    const id_mostra = getFirst(src.id_mostra, src['0'], src.ticket, src.id, 'N/A');
    const nm_origem = getFirst(src.nm_origem, src['3'], 'N/A');
    const nm_tipo = getFirst(src.nm_tipo, src['6'], 'N/A');
    const nm_status = getFirst(src.nm_status, src['8'], 'N/A');

    // Datas: Tenta corrigir o fuso horário (Assumindo BRT -03:00 se não vier nada)
    let dh_inicio = getFirst(src.dh_inicio, src['11'], src.data_ini, null);

    if (dh_inicio) {
        // Se a data for string e não tiver indicação de fuso (Z ou + ou -), adiciona -03:00
        const strDate = String(dh_inicio).trim();
        const hasTimezone = strDate.includes('Z') || strDate.match(/[+-]\d{2}:?\d{2}$/);

        if (!hasTimezone && strDate.length >= 10) {
            // Tenta converter formato "DD/MM/YYYY HH:MM:ss" para ISO compativel
            if (strDate.match(/^\d{2}\/\d{2}\/\d{4}/)) {
                // Formato brasileiro DD/MM/YYYY
                const [d, m, y, h, min, s] = strDate.split(/[\/\s:]/);
                // Monta ISO: YYYY-MM-DDTHH:mm:ss-03:00
                dh_inicio = `${y}-${m}-${d}T${h || '00'}:${min || '00'}:${s || '00'}-03:00`;
            } else {
                // Formato ISO simples (YYYY-MM-DD...) mas sem fuso
                // Adiciona o offset BRT na força bruta se parece ser ISO
                dh_inicio = strDate.replace(' ', 'T') + '-03:00';
            }
        }

        try {
            dh_inicio = new Date(dh_inicio).toISOString();
        } catch (e) {
            dh_inicio = new Date().toISOString(); // Fallback se falhar
        }
    } else {
        dh_inicio = new Date().toISOString();
    }

    // Sumário/Observação (limpando HTML)
    const ds_sumarioRaw = getFirst(src.ds_sumario, src['15'], src.obs, src.ticket_descricao, '');
    const ds_sumario = cleanHtml(ds_sumarioRaw);

    // Cidade e topologia
    const nm_cidade = getFirst(src.nm_cidade, src['28'], src.cidade, 'N/A');
    const topologia = getFirst(src.topologia, src['29'], 'N/A');
    const tp_topologia = getFirst(src.tp_topologia, src['31'], 'N/A');

    // Categorias produto/operacionais
    const nm_cat_prod2 = getFirst(src.nm_cat_prod2, src['38'], src.sintoma, 'N/A');
    const nm_cat_prod3 = getFirst(src.nm_cat_prod3, src['40'], 'N/A'); // << NOVO
    const nm_cat_oper2 = getFirst(src.nm_cat_oper2, src['44'], 'N/A');
    const nm_cat_oper3 = getFirst(src.nm_cat_oper3, src['46'], 'N/A');

    // Regionalização/agrupamentos
    const regional = getFirst(src.regional, src['55'], 'N/A');
    const grupo = getFirst(src.grupo, src['56'], 'N/A');
    const cluster = getFirst(src.cluster, src['57'], src.cluster_id, 'N/A');
    const subcluster = getFirst(src.subcluster, src['58'], src.subcluster_id, 'N/A');

    // Payload final para o sistema
    // Mapeamos para os campos exatos do banco
    return {
        id_mostra,
        nm_origem,
        nm_tipo,
        nm_status,
        dh_inicio,
        ds_sumario,
        nm_cidade,
        topologia,
        tp_topologia,
        nm_cat_prod2,
        nm_cat_prod3,
        nm_cat_oper2,
        nm_cat_oper3,
        regional,
        grupo,
        cluster,
        subcluster,
        // Opcional: manter o original em payload
        payload: src
    };
}

// ==== Gerar saída com filtros ====
const output = [];
for (const r of records) {
    // 1) Filtro regional → apenas LESTE
    const regionalNorm = normalize(getFirst(r.regional, r['55'], ''));
    if (!regionalNorm.includes('LESTE')) continue;

    // 2) Filtro sumário → excluir "PROBLEMA DE SEGURANÇA PÚBLICA"
    const dsRawForFilter = getFirst(r.ds_sumario, r['15'], r.obs, r.ticket_descricao, '');
    const dsNorm = normalize(cleanHtml(dsRawForFilter));
    if (
        dsNorm.includes('PROBLEMA DE SEGURANCA PUBLICA') ||
        dsNorm.includes('#PROBLEMA DE SEGURANCA PUBLICA') ||
        dsNorm.includes('SEGURANCA PUBLICA')
    ) {
        continue;
    }

    // 3) Filtro nm_tipo → apenas EMERGENCIAL
    const nmTipoNorm = normalize(getFirst(r.nm_tipo, r['6'], ''));
    if (nmTipoNorm !== 'EMERGENCIAL') continue;

    // 4) Filtro nm_cat_prod2 → apenas REDE OPTICA
    const prod2Norm = normalize(getFirst(r.nm_cat_prod2, r['38'], r.sintoma, ''));
    if (prod2Norm !== 'REDE OPTICA') continue;

    // 5) Filtro nm_cat_prod3 → deve conter NODE ou GPON   << NOVO
    const prod3Norm = normalize(getFirst(r.nm_cat_prod3, r['40'], ''));
    if (!(prod3Norm.includes('NODE') || prod3Norm.includes('GPON'))) continue;

    // Se passou nos filtros, mapeia campos
    const row = pickFields(r || {});

    // O n8n precisa que cada item seja um objeto com a chave "json"
    output.push({ json: row });
}

return output;
