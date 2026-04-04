import re
import os

with open('register.html', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Inject Search Box
search_box_html = """
            <div style="background:#f9fafb; border: 1px solid #e1e4e8; border-radius:8px; padding:12px; margin-bottom: 20px;">
                <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
                    <div style="flex:1; border:1px solid #d1d5db; padding:8px 12px; border-radius:6px; font-size:13px; outline:none; background:#fff; cursor:pointer; color:#888;" onclick="openPhotodbModal()">
                        포토DB 간편검색
                    </div>
                    <span style="font-size:18px; cursor:pointer;" onclick="openPhotodbModal()">🔍</span>
                </div>
            </div>
"""
target_text = '            <div style="font-size:13px; color:#111; margin-bottom:10px; font-weight:700;">\n                사진 등록 (최대 5장)'
text = text.replace(target_text, search_box_html + target_text)

# 2. Add WebP format option to imageCompression
option_target = """                    const options = {
                        maxSizeMB: 0.8,
                        maxWidthOrHeight: 1280,
                        useWebWorker: true
                    };"""
option_replacement = """                    const options = {
                        maxSizeMB: 0.8,
                        maxWidthOrHeight: 1280,
                        useWebWorker: true,
                        fileType: 'image/webp'
                    };"""
text = text.replace(option_target, option_replacement)

# Also rename the extension to .webp
compression_target = "const fileName = `${Date.now()}_${i}.${compressedFile.name.split('.').pop()}`;"
compression_replacement = "const fileName = `${Date.now()}_${i}.webp`;"
text = text.replace(compression_target, compression_replacement)


# 3. Read Photo DB Logic
with open('photodb_logic_dump.txt', 'r', encoding='utf-8') as f:
    photodb_logic = f.read()

# 4. Inject addPhotoFromDBToLibrary
custom_js = """
        // --- 포토DB에서 이미지 추가 ---
        window.addPhotoFromDBToLibrary = function(url, initialCaption, cAlign, iSize, iPos) {
            if (selectedFiles.length + existingImages.length >= 5) {
                alert("사진은 최대 5장까지만 등록 가능합니다.");
                return;
            }
            const previewContainer = document.getElementById('previewContainer');
            existingImages.push(url);
            
            const item = document.createElement('div');
            item.className = 'preview-item';
            item.innerHTML = `
                <img src="${url}">
                <button type="button" class="preview-remove">×</button>
            `;
            item.querySelector('.preview-remove').onclick = () => {
                existingImages = existingImages.filter(u => u !== url);
                item.remove();
            };
            previewContainer.appendChild(item);
        };
"""

body_end_idx = text.rfind('</body>')
text = text[:body_end_idx] + custom_js + "\n" + photodb_logic + "\n" + text[body_end_idx:]

with open('register.html', 'w', encoding='utf-8') as f:
    f.write(text)

print("Patched register.html successfully!")
