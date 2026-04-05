
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCoords() {
    const { data, count, error } = await supabase
        .from('news')
        .select('id, title, lat, lng', { count: 'exact' });

    if (error) {
        console.error(error);
        return;
    }

    const withCoords = data.filter(n => n.lat && n.lng).length;
    console.log(`Total: ${count}, With Coords: ${withCoords}, Missing Coords: ${count - withCoords}`);

    if (count - withCoords > 0) {
        console.log('Sample missing coords:');
        data.filter(n => !n.lat || !n.lng).slice(0, 3).forEach(n => console.log(`- ${n.title}`));
    }
}

checkCoords();
