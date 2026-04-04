import re

with open(r'c:\Users\user\Desktop\test\news_write.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Instead of exact match, let's use a regex to find the reader block inside confirmPhotoModal
pattern = re.compile(r'const reader = new FileReader\(\);\s*reader\.onload = function\(e\) \{.*?reader\.readAsDataURL\(file\);', re.DOTALL)
match = pattern.search(text)

if match:
    new_logic = '''const compressedFile = typeof compressImage === 'function' ? await compressImage(file, 1600, 0.8) : file;

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
        reader.readAsDataURL(compressedFile);'''
    text = text.replace(match.group(0), new_logic)
    with open(r'c:\Users\user\Desktop\test\news_write.html', 'w', encoding='utf-8') as f:
        f.write(text)
    print("SUCCESS REPLACE")
else:
    print("FAILED TO FIND")
