import re

with open(r'c:\Users\user\Desktop\test\news_write.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Make confirmPhotoModal async and apply compression
old_confirm = '''    function confirmPhotoModal() {
        const fileInput = document.getElementById('fileInput');'''

new_confirm = '''    async function confirmPhotoModal() {
        const fileInput = document.getElementById('fileInput');'''

text = text.replace(old_confirm, new_confirm)

old_logic = '''        const reader = new FileReader();
        reader.onload = function(e) {
            const dataUrl = e.target.result;
            
            if (typeof window.addPhotoFromDBToLibrary === 'function') {
                window.addPhotoFromDBToLibrary(dataUrl, caption, captionAlign, imgSize, imgPos);
            }
            
            // 폼 초기화
            fileInput.value = '';
            document.getElementById('fileName').textContent = '선택된 파일 없음';
            if (captionEls[0]) captionEls[0].value = '';
            
            closePhotoModal();
        };
        reader.readAsDataURL(file);
    }'''

new_logic = '''        // 공실등록과 동일하게 최대한 압축된 포맷(WebP)으로 변환
        const compressedFile = typeof compressImage === 'function' ? await compressImage(file, 1600, 0.8) : file;

        const reader = new FileReader();
        reader.onload = function(e) {
            const dataUrl = e.target.result;
            
            if (typeof window.addPhotoFromDBToLibrary === 'function') {
                window.addPhotoFromDBToLibrary(dataUrl, caption, captionAlign, imgSize, imgPos);
            }
            
            // 폼 초기화
            fileInput.value = '';
            document.getElementById('fileName').textContent = '선택된 파일 없음';
            if (captionEls[0]) captionEls[0].value = '';
            
            closePhotoModal();
        };
        reader.readAsDataURL(compressedFile);
    }'''

text = text.replace(old_logic, new_logic)

with open(r'c:\Users\user\Desktop\test\news_write.html', 'w', encoding='utf-8') as f:
    f.write(text)

print("SUCCESS")
