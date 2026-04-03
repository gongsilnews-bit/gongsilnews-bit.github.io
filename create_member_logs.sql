-- member_logs 테이블 생성 스크립트

CREATE TABLE IF NOT EXISTS public.member_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- 변경 대상 회원 (누구의 정보가 변경되었는가)
    target_uid UUID REFERENCES public.members(id) ON DELETE CASCADE,
    target_email TEXT,
    
    -- 변경 행위
    action_type TEXT NOT NULL,          -- 예: '회원정보수정', '회원가입', '권한변경' 등
    details TEXT,                       -- 예: '본인이 회원정보수정', '관리자가 회원정보수정 - 일반회원 전환' 등
    
    -- 변경 실행자 (누가 변경했는가)
    actor_uid UUID REFERENCES public.members(id) ON DELETE SET NULL,
    actor_email TEXT,
    
    -- 아이피
    ip_address TEXT,
    
    -- 발생 일시
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 인덱스 생성 (회원별 이력 조회를 빠르게 하기 위해)
CREATE INDEX IF NOT EXISTS idx_member_logs_target_uid ON public.member_logs(target_uid);
CREATE INDEX IF NOT EXISTS idx_member_logs_created_at ON public.member_logs(created_at DESC);

-- RLS (Row Level Security) 설정
ALTER TABLE public.member_logs ENABLE ROW LEVEL SECURITY;

-- 1. 누구나 (또는 인증된 사용자) 로깅을 생성할 수 있음
CREATE POLICY "anyone_can_insert_logs" ON public.member_logs
    FOR INSERT
    TO authenticated, anon
    WITH CHECK (true);

-- 2. 관리자만 모든 로그를 조회할 수 있음
CREATE POLICY "admin_can_read_logs" ON public.member_logs
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.members WHERE members.id = auth.uid() AND members.role = 'admin'
        )
    );

-- 3. 본인 내역은 본인도 볼 수 있음 (사용자 마이페이지 기능 확장 대비)
CREATE POLICY "user_can_read_own_logs" ON public.member_logs
    FOR SELECT
    TO authenticated
    USING (
        target_uid = auth.uid()
    );
