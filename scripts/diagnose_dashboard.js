
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    console.log('Checking incidents table...');

    // 1. Check count
    const { count, error: countError } = await supabase
        .from('incidents')
        .select('*', { count: 'exact', head: true });

    if (countError) {
        console.error('Error counting incidents:', countError);
        return;
    }
    console.log(`Total incidents: ${count}`);

    if (count === 0) return;

    // 2. Fetch sample data
    const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .limit(5);

    if (error) {
        console.error('Error fetching data:', error);
        return;
    }

    console.log('Sample data (first 5):');
    data.forEach(i => {
        console.log(`ID: ${i.id}, Prod2: '${i.nm_cat_prod2}', Prod3: '${i.nm_cat_prod3}', Status: '${i.nm_status}'`);
    });

    // 3. Check filters
    const { count: filteredCount, error: filterError } = await supabase
        .from('incidents')
        .select('*', { count: 'exact', head: true })
        .ilike('nm_cat_prod2', '%REDE OPTICA%')
        .or('nm_cat_prod3.ilike.%GPON%,nm_cat_prod3.ilike.%NODE%');

    if (filterError) {
        console.error('Error checking filters:', filterError);
        return;
    }
    console.log(`Incidents matching filters (REDE OPTICA + GPON/NODE): ${filteredCount}`);
}

checkData();
