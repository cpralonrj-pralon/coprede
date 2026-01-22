/**
 * Test Script for Ingestion API
 * Usage: node scripts/test-ingestion.js
 */

// Configuration
const API_URL = 'http://localhost:3000/ingestion/incident';
const API_KEY = '9f4c8e2a1b7d4e3aA8D6F2cB9E7D0a4F5C8E1B6D2A9F3';

const MOCK_BATCH = [
    {
        id_mostra: `TEST-${Date.now()}-1`,
        nm_origem: "SCRIPT_TEST",
        nm_tipo: "FALHA_ESM",
        nm_status: "ABERTO",
        dh_inicio: new Date().toISOString(),
        ds_sumario: "Teste ESM Success",
        nm_cidade: "RECIFE",
        regional: "NE",
        cluster: "LITORAL",
        nm_cat_oper2: "FIBRA",
        nm_cat_prod3: "GPON"
    }
];

async function runTest() {
    console.log('🚀 Starting Ingestion Test (ESM)...');
    console.log(`Target: ${API_URL}`);

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY
            },
            body: JSON.stringify(MOCK_BATCH)
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ Success!');
            console.log('Response:', JSON.stringify(data, null, 2));
        } else {
            console.error('❌ Failed:', response.status, response.statusText);
            console.error('Error Data:', JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error('❌ Network Error:', error.message);
        if (error.cause) console.error('Cause:', error.cause);
    }
}

runTest();
