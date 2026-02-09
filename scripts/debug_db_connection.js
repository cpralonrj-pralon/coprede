
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in backend/.env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    console.log('Checking incidents count...');

    const { count, error } = await supabase
        .from('incidents')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error('Error counting incidents:', error.message);
    } else {
        console.log(`Total Incidents in DB: ${count}`);
    }

    // Check distinct nm_cat_oper2
    const { data: oper2, error: errOper2 } = await supabase
        .from('incidents')
        .select('nm_cat_oper2')
        .limit(200);

    if (oper2) {
        const counts = {};
        oper2.forEach(i => {
            const k = i.nm_cat_oper2;
            counts[k] = (counts[k] || 0) + 1;
        });
        console.log('Oper2 Distribution:', JSON.stringify(counts, null, 2));
    }

    // Check distinct nm_cat_prod2 and topologia/prod3
    const { data: prod2, error: err3 } = await supabase
        .from('incidents')
        .select('nm_cat_prod2, nm_cat_prod3, ds_sumario')
        .limit(100);

    if (prod2) {
        const counts = {};
        prod2.forEach(i => {
            const k = `P2: ${i.nm_cat_prod2} | P3: ${i.nm_cat_prod3}`;
            counts[k] = (counts[k] || 0) + 1;
        });
        console.log('Category Distribution:', JSON.stringify(counts, null, 2));

        const sumarios = {};
        prod2.forEach(i => {
            if (i.ds_sumario && i.ds_sumario.includes('SEGURANCA')) {
                sumarios['CONTAINS_SEGURANCA'] = (sumarios['CONTAINS_SEGURANCA'] || 0) + 1;
            }
        });
        console.log('Sumario Analytics:', sumarios);
    }
}

checkData();
