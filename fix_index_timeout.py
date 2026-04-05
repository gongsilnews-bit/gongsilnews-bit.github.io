import os

file_path = "c:/Users/user/Desktop/test/index.html"
with open(file_path, "r", encoding="utf-8") as f:
    html = f.read()

# Original string piece 1
orig_start = """        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(async () => {
                const newsDb = window.gongsiClient;
                if(!newsDb) return;"""

# New string piece 1
new_start = """        document.addEventListener('DOMContentLoaded', function() {
            const initNews = async () => {
                const newsDb = window.gongsiClient || window.supabaseClient;
                if(!newsDb) {
                    // If not ready, retry in 20ms without hardblocking
                    setTimeout(initNews, 20);
                    return;
                }"""

# Original string piece 2
orig_end = """                fetchAndRenderVideoNews();
                
}, 500); // end setTimeout
        });"""

# New string piece 2
new_end = """                fetchAndRenderVideoNews();
                
            };
            initNews();
        });"""

if orig_start in html and orig_end in html:
    html = html.replace(orig_start, new_start)
    html = html.replace(orig_end, new_end)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(html)
    print("Successfully removed 500ms delay and added smart retry loop in index.html")
else:
    print("Could not find the target strings. Please check.")
