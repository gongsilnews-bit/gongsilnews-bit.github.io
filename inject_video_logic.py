import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

new_func = """
                async function fetchAndRenderVideoNews() {
                    const target = document.getElementById('home-video-grid');
                    if(!target || !newsDb) return;
                    
                    const {data, error} = await newsDb.from('articles')
                        .select('*')
                        .eq('status', 'published')
                        .eq('section1', '우리동네부동산')
                        .order('created_at', {ascending: false})
                        .limit(20);
                        
                    if (error) {
                        console.error('Error fetching videos:', error);
                        return;
                    }
                    
                    if (!data || data.length === 0) {
                        target.innerHTML = '<div style="grid-column:1/-1; padding:20px; color:#999; font-size:14px; text-align:center;">최근 등록된 동영상 기사가 없습니다.</div>';
                        return;
                    }
                    
                    let videos = [];
                    for (let item of data) {
                        if (videos.length >= 3) break;
                        
                        let vid = null;
                        if (item.content) {
                            const ytMatch = item.content.match(/(?:youtube\\.com\\/(?:watch\\?v=|shorts\\/)|youtu\\.be\\/)([A-Za-z0-9_-]{11})/);
                            if (ytMatch) vid = ytMatch[1];
                            else {
                                const embedMatch = item.content.match(/youtube\\.com\\/embed\\/([A-Za-z0-9_-]{11})/);
                                if (embedMatch) vid = embedMatch[1];
                            }
                        }
                        if (vid) {
                            item._videoId = vid;
                            videos.push(item);
                        }
                    }
                    
                    if (videos.length > 0) {
                        let innerHtml = '';
                        videos.forEach(item => {
                            const imgUrl = `https://img.youtube.com/vi/${item._videoId}/mqdefault.jpg`;
                            innerHtml += `
                            <div class="vid-item" onclick="window.location.href='news_read.html?id=${item.id}'">
                                <div class="vid-thumb" style="background: url('${imgUrl}') center/cover; position:relative;">
                                    <div class="vid-play" style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:44px; height:44px; background:rgba(0,0,0,0.6); border-radius:50%; border:2px solid #fff; display:flex; justify-content:center; align-items:center;">
                                        <div style="width:0; height:0; border-top:8px solid transparent; border-bottom:8px solid transparent; border-left:12px solid #fff; margin-left:4px;"></div>
                                    </div>
                                </div>
                                <div class="vid-title" style="margin-top:10px; font-weight:bold; font-size:15px; color:#111;">${item.title || '제목없음'}</div>
                            </div>
                            `;
                        });
                        target.innerHTML = innerHtml;
                    } else {
                        target.innerHTML = '<div style="grid-column:1/-1; padding:20px; color:#999; font-size:14px; text-align:center;">최근 등록된 동영상 기사가 없습니다.</div>';
                    }
                }
                
                fetchAndRenderVideoNews();
                
"""

target_str = '}, 500); // end setTimeout'
html = html.replace(target_str, new_func + target_str)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated video grid logic successfully.")
