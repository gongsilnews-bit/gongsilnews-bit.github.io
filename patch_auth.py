import re

with open('supabase_auth.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Make handleLoginClick accept action
target = "    window.handleLoginClick = async function(e) {"
replacement = "    window.handleLoginClick = async function(e, action = 'signup') {"
text = text.replace(target, replacement)

# Pass action to showGongsilLoginModal
target = "            showGongsilLoginModal(redirectUrl);"
replacement = "            showGongsilLoginModal(redirectUrl, action);"
text = text.replace(target, replacement)

# Add action parameter to showGongsilLoginModal
target = "    function showGongsilLoginModal(redirectUrl) {"
replacement = "    function showGongsilLoginModal(redirectUrl, action) {"
text = text.replace(target, replacement)

# Modify the modal title/desc before showing it
target = "        modal.style.display = 'flex';"
replacement = """        const titleEl = modal.querySelector('.glb-title');
        const descEl = modal.querySelector('.glb-desc');
        if (action === 'login') {
            titleEl.textContent = '반갑습니다! 공실뉴스 로그인';
            descEl.textContent = '로그인하시고 공실뉴스만의 혜택을 누려보세요';
        } else {
            titleEl.textContent = '공실뉴스 회원이 되어 보세요';
            descEl.textContent = '지금 바로 공실뉴스 회원으로 가입하시고, 독점 혜택을 누려보세요';
        }
        modal.style.display = 'flex';"""
text = text.replace(target, replacement)

# Modify event listeners to pass action
target = "    loginBtns.forEach(btn => btn.addEventListener('click', window.handleLoginClick));"
replacement = """    loginBtns.forEach(btn => btn.addEventListener('click', e => {
        // Find if this specific button says 로그인
        const isLogin = e.target.textContent.includes('로그인') || e.target.id === 'headerLoginOnlyBtn';
        window.handleLoginClick(e, isLogin ? 'login' : 'signup');
    }));"""
text = text.replace(target, replacement)

with open('supabase_auth.js', 'w', encoding='utf-8') as f:
    f.write(text)

print("Patched supabase_auth.js successfully!")
