const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kjrjrjnsiynrcelzepju.supabase.co';
const supabaseKey = 'sb_publishable_pwzXQ_2LgDo-mhjBIKcXmw_KS8es5Cj';
const supabase = createClient(supabaseUrl, supabaseKey);

async function optimizeArticles() {
    console.log("Fetching articles...");
    const { data: articles, error } = await supabase.from('articles').select('id, content, subtitle, image_url');
    if (error) {
        console.error("Error fetching articles:", error);
        return;
    }

    let updatedCount = 0;

    for (let article of articles) {
        let updates = {};
        let needsUpdate = false;

        // 1. Extract plain text subtitle if missing
        if (!article.subtitle && article.content) {
            let text = article.content.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
            if (text.length > 0) {
                updates.subtitle = text.substring(0, 100);
                needsUpdate = true;
            }
        }

        // 2. Extract image_url from content if missing
        if (!article.image_url && article.content) {
            const imgMatch = article.content.match(/<img[^>]+src=['"]([^'"]+)['"]/);
            if (imgMatch && imgMatch[1]) {
                updates.image_url = imgMatch[1];
                needsUpdate = true;
            }
        }

        if (needsUpdate) {
            // console.log(`Updating article ${article.id}...`, updates);
            const { error: updateErr } = await supabase.from('articles').update(updates).eq('id', article.id);
            if (!updateErr) updatedCount++;
        }
    }

    console.log(`DB Optimization complete. Updated ${updatedCount} articles.`);
}

optimizeArticles();
