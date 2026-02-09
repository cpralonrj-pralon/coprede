
import { createClient } from '@supabase/supabase-js';

// Credentials from .env.local (Frontend)
const supabaseUrl = 'https://wthzxrgifjtenaujhdbb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0aHp4cmdpZmp0ZW5hdWpoZGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMjYwODIsImV4cCI6MjA4NDYwMjA4Mn0.MGhDMxfbbKGc69Mut8M7ESmULS8d10VgeIu_vXcorpc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFetch() {
    console.log('Testing fetch with ANON key...');

    try {
        const { data, error } = await supabase
            .from('incidents')
            .select('*')
            .limit(10);

        if (error) {
            console.error('Fetch Error:', error);
        } else {
            console.log(`Success! Fetched ${data.length} records.`);
            if (data.length === 0) {
                console.log('Warning: 0 records fetched. RLS might be blocking access for Anon.');
            }
        }

        // Try with exact frontend query (simplified)
        console.log('Testing frontend query...');
        const { data: feData, error: feError } = await supabase
            .from('incidents')
            .select('*')
            .order('dh_inicio', { ascending: false })
            .limit(10);

        if (feError) {
            console.error('Frontend Query Error:', feError);
        } else {
            console.log(`Frontend Query Success! Items: ${feData.length}`);
        }

    } catch (e) {
        console.error('Exception:', e.message);
    }
}

testFetch();
