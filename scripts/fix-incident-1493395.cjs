require('dotenv').config({ path: '../.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wthzxrgifjtenaujhdbb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0aHp4cmdpZmp0ZW5hdWpoZGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMjYwODIsImV4cCI6MjA4NDYwMjA4Mn0.MGhDMxfbbKGc69Mut8M7ESmULS8d10VgeIu_vXcorpc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function forceUpdate() {
    console.log('Forcing update for INM00001493395...');

    // 13:48 BRT = 16:48 UTC. 
    // We want to force it to 16:48:05 UTC.

    const { data, error } = await supabase
        .from('incidents')
        .update({ dh_inicio: '2026-01-28T16:48:05+00:00' })
        .eq('id_mostra', 'INM00001493395')
        .select();

    if (error) {
        console.error('Error updating:', error);
    } else {
        console.log('Update success:', data);
    }
}

forceUpdate();
