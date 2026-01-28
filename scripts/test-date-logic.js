function testLogic() {
    const src = {
        dh_inicio: '2026-01-28 13:48:05'
    };

    function getFirst(...vals) {
        for (const v of vals) {
            if (v !== undefined && v !== null) return v;
        }
        return undefined;
    }

    // --- LOGIC FROM USER ---
    let dh_inicio = getFirst(src.dh_inicio, src['11'], src.data_ini, null);

    if (dh_inicio) {
        const strDate = String(dh_inicio).trim();
        // Verifica se já tem indicação de fuso (Z ou +00:00)
        const hasTimezone = strDate.includes('Z') || strDate.match(/[+-]\d{2}:?\d{2}$/);

        console.log(`Input: "${strDate}"`);
        console.log(`Has Timezone: ${hasTimezone}`);

        if (!hasTimezone && strDate.length >= 10) {
            // Se for DD/MM/YYYY HH:MM:ss, converte para ISO
            if (strDate.match(/^\d{2}\/\d{2}\/\d{4}/)) {
                const [d, m, y, h, min, s] = strDate.split(/[\/\s:]/);
                // Força o offset -03:00 (Brasília)
                dh_inicio = `${y}-${m}-${d}T${h || '00'}:${min || '00'}:${s || '00'}-03:00`;
                console.log(`Path A (DD/MM): ${dh_inicio}`);
            } else {
                // Se for YYYY-MM-DD HH:MM:ss, apenas formata e adiciona offset
                dh_inicio = strDate.replace(' ', 'T') + '-03:00';
                console.log(`Path B (YYYY-MM): ${dh_inicio}`);
            }
        }

        try {
            // Normaliza para string ISO
            const final = new Date(dh_inicio).toISOString();
            console.log(`Final ISO (db stores this): ${final}`);
            console.log(`Comparison:`);
            console.log(`  Expected (13:48 BRT -> UTC): 2026-01-28T16:48:05.000Z`);
            console.log(`  Actual:                      ${final}`);
        } catch (e) {
            console.error('Date parse error');
        }
    }
}

testLogic();
