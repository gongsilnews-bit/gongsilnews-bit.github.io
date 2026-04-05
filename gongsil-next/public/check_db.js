
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkNews() {
    const { data, count, error } = await supabase
        .from('news')
        .select('*', { count: 'exact' })
        .order('pub_date', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Error fetching news:', error.message);
        return;
    }

    console.log('Total news count:', count);
    console.log('Latest 5 news articles:');
    data.forEach(n => {
        console.log(`- [${n.pub_date}] ${n.title}`);
    });
}

checkNews();
