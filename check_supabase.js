
const { createClient } = require('@supabase/supabase-js');

// 직접 설정 정보 입력 (config 파일 참고)
const URL = 'https://kjrjrjnsiynrcelzepju.supabase.co';
const KEY = 'sb_publishable_pwzXQ_2LgDo-mhjBIKcXmw_KS8es5Cj';

const supabase = createClient(URL, KEY);

async function checkDB() {
    console.log("--- Supabase 'properties' 테이블 상태 체크 ---");
    
    // 1. 전체 매물 조회
    const { data: properties, error: pError, count } = await supabase
        .from('properties')
        .select('*', { count: 'exact' });

    if (pError) {
        console.error("매물 조회 에러:", pError.message);
    } else {
        console.log(`전체 매물 수: ${count}개`);
        if (properties && properties.length > 0) {
            console.log("\n[최근 등록된 매물 5개 정보]");
            properties.slice(0, 5).forEach((p, idx) => {
                console.log(`${idx + 1}. ID: ${p.id}, user_id: ${p.user_id}, status: ${p.status}, 건물명: ${p.building_name}`);
            });
        }
    }

    // 2. 회원 정보 조회 (참고용)
    const { data: members, error: mError } = await supabase
        .from('members')
        .select('id, email, role')
        .limit(5);

    if (mError) {
        console.error("회원 조회 에러:", mError.message);
    } else {
        console.log("\n[등록된 회원 정보 (일부)]");
        members.forEach(m => {
            console.log(`Email: ${m.email}, Role: ${m.role}, ID: ${m.id}`);
        });
    }
}

checkDB();
