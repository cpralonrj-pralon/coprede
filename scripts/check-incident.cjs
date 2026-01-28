const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://wthzxrgifjtenaujhdbb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0aHp4cmdpZmp0ZW5hdWpoZGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMjYwODIsImV4cCI6MjA4NDYwMjA4Mn0.MGhDMxfbbKGc69Mut8M7ESmULS8d10VgeIu_vXcorpc';

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkIncident() {
    const idToCheck = '1493266';
    console.log(`Checking for incident with ID containing: ${idToCheck}`);

    const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .ilike('id_mostra', `%${idToCheck}%`);

    if (error) {
        console.error('Error:', error);
        return;
    }

    if (data.length === 0) {
        console.log('No incident found.');
    } else {
        console.log('Found Incident:', JSON.stringify(data[0], null, 2));
    }
}

checkIncident();
