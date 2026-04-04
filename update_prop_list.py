import glob
import os
import re

new_func = """async function loadRecommendSidebarProps() {
        const container = document.getElementById('recommendPropSidebarContainer');
        const sb = window.gongsiClient || window.supabaseClient;
        if(!sb) return;

        const { data, error } = await sb.from('properties')
            .select('*')
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(4);

        if(error || !data || data.length === 0) {
            container.innerHTML = '<div style="padding:20px; text-align:center; color:#999; font-size:13px;">추천 공실이 없습니다.</div>';
            return;
        }

        function formatPriceValue(val) {
            val = Number(val);
            if (!val || val === 0) return '0';
            if (val >= 10000) {
                const uk = Math.floor(val / 10000);
                const man = val % 10000;
                return man > 0 ? `${uk}억 ${man}` : `${uk}억`;
            }
            return val.toLocaleString();
        }

        container.innerHTML = data.map(p => {
            let propTitle = p.building_name || p.property_type || '공실매물';
            if (p.main_category === '아파트·오피스텔') {
                let aptName = p.building_name || p.property_type || '';
                let dongStr = '';
                if (p.dong_number) dongStr = String(p.dong_number).includes('동') ? p.dong_number : `${p.dong_number}동`;
                let roomStr = '';
                if (p.room_number) roomStr = String(p.room_number).includes('호') ? p.room_number : `${p.room_number}호`;
                let tempStr = `${aptName} ${dongStr} ${roomStr}`.trim();
                if (tempStr) propTitle = tempStr;
            }

            const badgeText = (function(pf) {
                if (!pf) return '공실매물';
                if (pf.includes('100') || pf.includes('양타')) return '수수료100%';
                if (pf.includes('50') || pf.includes('단타')) return '수수료50%';
                if (pf.includes('25')) return '수수료25%';
                if (pf.includes('공동')) return '공동중개';
                return '공동중개';
            })(p.brokerage_fee);

            const dep = formatPriceValue(p.deposit);
            let priceStr = '';
            if (p.trade_type === '매매' || p.trade_type === '전세') priceStr = `${p.trade_type} ${dep}`;
            else priceStr = `${p.trade_type} ${dep}/${p.monthly_rent || 0}`;

            const supAreaM2 = p.supply_area ? parseFloat(p.supply_area) : 0;
            const excAreaM2 = p.dedicated_area ? parseFloat(p.dedicated_area) : (p.area ? parseFloat(p.area) : 0);
            const fmtM2P = (m2) => m2 ? `${m2}㎡(${(m2 / 3.3058).toFixed(1)}평)` : '';
            let areaDisplay = '';
            if (supAreaM2 && excAreaM2) areaDisplay = `${fmtM2P(supAreaM2)} / ${fmtM2P(excAreaM2)}`;
            else if (supAreaM2) areaDisplay = fmtM2P(supAreaM2);
            else if (excAreaM2) areaDisplay = fmtM2P(excAreaM2);

            let locStr = '';
            if(p.address) {
                 const words = p.address.split(' ');
                 if(words.length > 2) locStr = words[2];
                 else locStr = words[0];
            } else {
                 locStr = p.location || '';
            }

            let metaArr = [];
            if(locStr) metaArr.push(locStr);
            if(areaDisplay) metaArr.push('면적 ' + areaDisplay);
            
            let extraArr = [];
            if(p.room_count) extraArr.push(`룸 ${p.room_count}개`);
            if(p.bathroom_count) extraArr.push(`욕실 ${p.bathroom_count}개`);
            
            let metaHtml = metaArr.join(' · ');
            if (extraArr.length > 0) metaHtml += '<br>' + extraArr.join(', ');

            let imgUrl = (p.images && p.images.length > 0) ? p.images[0] : 'https://via.placeholder.com/80?text=NoImg';

            return `
            <div class="prop-item" onclick="window.location.href='gongsil/index.html'">
                <div class="prop-info" style="min-width:0; overflow:hidden;">
                    <div class="prop-title" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width:180px;">${propTitle}</div>
                    <div class="prop-price">${priceStr}</div>
                    <div class="prop-meta">${metaHtml}</div>
                    <span class="prop-badge">${badgeText}</span>
                </div>
                <div class="prop-img-wrapper" style="flex-shrink:0;">
                    <img src="${imgUrl}" class="prop-img" onerror="this.src='https://via.placeholder.com/80?text=NoImg'">
                </div>
            </div>
            `;
        }).join('');
    }"""

files = ['news_all.html', 'news.html', 'news_finance.html', 'news_politics.html', 'news_law.html', 'news_life.html', 'news_etc.html', 'board.html', 'news_read.html', 'study_detail.html', 'build_news_all.py', 'build_news_read.py']

for filepath in files:
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        idx = content.find('async function loadRecommendSidebarProps')
        if idx != -1:
            end_idx = content.find('</script>', idx)
            # Find the match of the whole function block. It ends right before `</script>` or before the next `function` or `</script>`
            
            depth = 0
            start_brace = content.find('{', idx)
            curr = start_brace + 1
            depth = 1
            while depth > 0 and curr < len(content):
                if content[curr] == '{': depth += 1
                elif content[curr] == '}': depth -= 1
                curr += 1
            
            end_brace = curr
            
            new_content = content[:idx] + new_func + content[end_brace:]
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {filepath}")
