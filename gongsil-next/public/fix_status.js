const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kjrjrjnsiynrcelzepju.supabase.co';
const supabaseKey = 'sb_publishable_pwzXQ_2LgDo-mhjBIKcXmw_KS8es5Cj';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fix() {
    console.log("Fixing status...");
    const { data, error } = await supabase
        .from('articles')
        .update({ status: 'published' })
        .eq('status', 'approve');
    
    if (error) console.error("Error:", error);
    else console.log("Success! Updated articles to 'published'");
}

fix();
