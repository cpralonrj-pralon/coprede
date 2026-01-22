
// Native fetch is used (Node 18+)

const API_URL = 'https://coprede-production.up.railway.app/ingestion/incident';
// const API_URL = 'http://localhost:3000/ingestion/incident'; // Local Dev
// Using the key we know is in local .env or hardcoding for the script since we know it from previous context
const API_KEY = '9f4c8e2a1b7d4e3aA8D6F2cB9E7D0a4F5C8E1B6D2A9F3';

const CITIES = [
    { name: 'SAO PAULO', region: 'SPI', cluster: 'CAPITAL' },
    { name: 'CAMPINAS', region: 'SPI', cluster: 'INTERIOR' },
    { name: 'SANTOS', region: 'SPI', cluster: 'LITORAL' },
    { name: 'RIBEIRAO PRETO', region: 'SPI', cluster: 'INTERIOR' },
    { name: 'RIO DE JANEIRO', region: 'RJ', cluster: 'CAPITAL' },
    { name: 'NITEROI', region: 'RJ', cluster: 'METROPOLITANA' },
    { name: 'BELO HORIZONTE', region: 'MG', cluster: 'CAPITAL' },
    { name: 'CURITIBA', region: 'SUL', cluster: 'PR' },
    { name: 'PORTO ALEGRE', region: 'SUL', cluster: 'RS' },
    { name: 'SALVADOR', region: 'NE', cluster: 'BA' }
];

const TYPES = [
    'ROMPIMENTO_FIBRA',
    'FALHA_ENERGIA',
    'FALHA_SINAL',
    'DEGRADACAO_MASSIVA',
    'FALHA_EQUIPAMENTO',
    'MANUTENCAO_EMERGENCIAL'
];

const STATUSES = ['ABERTO', 'EM_ANALISE', 'EM_TRATAMENTO', 'AGUARDANDO_CAMPO'];

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateIncidents(count) {
    const incidents = [];
    for (let i = 0; i < count; i++) {
        const city = getRandomItem(CITIES);
        const type = getRandomItem(TYPES);
        const status = getRandomItem(STATUSES);

        incidents.push({
            id_mostra: `MOCK-${Date.now()}-${i}`,
            nm_origem: "MOCK_SEED",
            nm_tipo: type,
            nm_status: status,
            dh_inicio: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString(), // Last 24h
            ds_sumario: `Incidente simulado: ${type} afetando região de ${city.name}`,
            nm_cidade: city.name,
            regional: city.region,
            cluster: city.cluster,
            nm_cat_oper2: "FIBRA",
            nm_cat_prod3: "GPON"
        });
    }
    return incidents;
}

async function seed() {
    console.log('🌱 Generating 50 mock incidents...');
    const batch = generateIncidents(50);

    console.log(`🚀 Sending to ${API_URL}...`);

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY
            },
            body: JSON.stringify(batch)
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Seed successful!');
            console.log(JSON.stringify(data, null, 2));
        } else {
            console.error('❌ Failed:', response.status, response.statusText);
            const text = await response.text();
            console.error(text);
        }
    } catch (error) {
        console.error('❌ Network Error:', error.message);
    }
}

seed();
