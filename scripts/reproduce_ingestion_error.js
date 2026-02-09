
const apiKey = '9f4c8e2a1b7d4e3aA8D6F2cB9E7D0a4F5C8E1B6D2A9F3';

async function testIngestion() {
    const url = 'http://localhost:3005/ingestion/incident';

    const payload = [
        {
            "id_mostra": "INM00001489988",
            "nm_origem": "INCIDENTE",
            "nm_tipo": "EMERGENCIAL",
            "nm_status": "PENDENTE",
            "dh_inicio": "2026-01-27T19:12:00.000Z",
            "ds_sumario": "GPON_RJ NT2 | MDUXREDE MUDANCA DE PACOTE  | AC MANHÃ",
            "nm_cidade": "RIO DE JANEIRO",
            "topologia": "MRR.AF.141.00.010",
            "tp_topologia": "GPON",
            "nm_cat_prod2": "REDE OPTICA",
            "nm_cat_prod3": "GPON",
            "nm_cat_oper2": "INTERRUPCAO",
            "nm_cat_oper3": "PENDENCIA INSTALACAO",
            "regional": "LESTE",
            "grupo": "Rio / Espirito Santo",
            "cluster": "RIO CAPITAL",
            "subcluster": "RIO CAPITAL"
        }
    ];

    try {
        console.log(`Sending POST to ${url}...`);
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey
            },
            body: JSON.stringify(payload),
        });

        console.log('Response Status:', response.status);
        const data = await response.json();
        console.log('Response Data:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testIngestion();
