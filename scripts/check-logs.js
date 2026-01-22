
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env from backend/.env
dotenv.config({ path: path.resolve('backend', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing credentials in backend/.env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLogs() {
    console.log('🔍 Checking Ingestion Logs...');

    // Get last 5 logs
    const { data: logs, error: logsError } = await supabase
        .from('ingestion_logs')
        .select('*')
        .order('executed_at', { ascending: false })
        .limit(5);

    if (logsError) {
        console.error('❌ Error fetching logs:', logsError.message);
        return;
    }

    if (logs && logs.length > 0) {
        console.table(logs.map(l => ({
            Time: new Date(l.executed_at).toLocaleString(),
            Status: l.status,
            Batch: l.batch_size,
            Inserted: l.inserted,
            Updated: l.updated,
            Errors: l.errors
        })));
    } else {
        console.log('⚠️ No logs found.');
    }

    // Get Total Counts grouped by Origin
    const { data: allIncidents, error: allErr } = await supabase
        .from('incidents')
        .select('id, nm_origem, created_at');

    if (allIncidents) {
        const total = allIncidents.length;
        console.log(`\n📊 TOTAL Incidents in DB: ${total}`);

        // Group by Origin
        const byOrigin = allIncidents.reduce((acc, curr) => {
            acc[curr.nm_origem] = (acc[curr.nm_origem] || 0) + 1;
            return acc;
        }, {});

        console.log('📈 Breakdown by Origin:');
        console.table(byOrigin);

        // Group by Day (created_at)
        const byDay = allIncidents.reduce((acc, curr) => {
            const day = new Date(curr.created_at).toLocaleDateString();
            acc[day] = (acc[day] || 0) + 1;
            return acc;
        }, {});

        console.log('📅 Breakdown by Ingestion Date:');
        console.table(byDay);
    }
}

checkLogs();
