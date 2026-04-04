-- ========================================================
-- [ 통합 게시판 시스템 DB 아키텍처 (Single Table Design) ]
-- ========================================================

-- 1. 게시판 메타 테이블 (게시판 종류, 스킨, 권한 설정 등 저장)
CREATE TABLE IF NOT EXISTS public.boards (
    board_id VARCHAR(50) PRIMARY KEY,       -- 게시판 고유 ID (예: 'bbs_drone', 'bbs_notice')
    board_name VARCHAR(100) NOT NULL,       -- 관리자가 정한 게시판 한글명 (예: '드론 영상 자료실')
    subtitle VARCHAR(100),                  -- 타이틀 옆 서브설명 (예: '#기자전용')
    skin_type VARCHAR(50) DEFAULT 'default_bbs', -- 스킨 선택상태 (default_bbs, video_album, file_album)
    categories TEXT,                        -- 쉼표로 구분된 카테고리값 (예: '전체,드론,상가,아파트')
    auth_list INTEGER DEFAULT 1,            -- 목록 보기 가능 레벨 (1: 일반/ 5: 기자/ 9: 관리자 등)
    auth_read INTEGER DEFAULT 1,            -- 본문/다운로드 가능 레벨
    auth_write INTEGER DEFAULT 9,           -- 글쓰기 가능 레벨
    point_cost_read INTEGER DEFAULT 0,      -- (향후 확장) 열람 시 차감할 포인트
    point_cost_download INTEGER DEFAULT 0,  -- (향후 확장) 다운로드 시 차감할 포인트
    is_active BOOLEAN DEFAULT TRUE,         -- 게시판 활성 상태 여부
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 통합 게시물 테이블 (모든 게시판의 게시글이 모이는 곳)
CREATE TABLE IF NOT EXISTS public.board_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board_id VARCHAR(50) NOT NULL REFERENCES public.boards(board_id) ON DELETE CASCADE,
    author_id UUID NOT NULL,               -- (auth.users 가 있다면 FK 로 사용)
    author_name VARCHAR(100),               -- 닉네임 (조인 비용 절감을 위한 반정규화)
    category VARCHAR(50),                   -- 해당 게시글이 속한 탭 (예: '드론')
    title VARCHAR(255) NOT NULL,
    content TEXT,                           -- HTML 본문 내용
    youtube_url VARCHAR(255),               -- 비디오 스킨 전용 URL
    drive_url VARCHAR(255),                 -- 자료실 다운로드 링크 (구글드라이브 등)
    thumbnail_url VARCHAR(500),             -- 디자인/자료실 스킨 썸네일
    view_count INTEGER DEFAULT 0,           -- 조회수
    is_notice BOOLEAN DEFAULT FALSE,        -- 공지글 (상단고정) 여부
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 통합 게시판 정책(RLS) 기본 세팅 
-- (원칙: 누구나 읽을 수 있되, 상세조회/쓰기는 프론트에서 auth_read/auth_write 로 1차 방어)

-- boards 테이블 정책 설정
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "게시판 목록은 누구나 조회 가능"
ON public.boards FOR SELECT USING (is_active = true);

CREATE POLICY "게시판 생성 및 수정은 최고관리자만"
ON public.boards FOR ALL USING (auth.role() = 'authenticated'); -- 실제 적용시 관리자 검증 조건 추가

-- board_posts 테이블 정책 설정
ALTER TABLE public.board_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "게시글은 누구나 조회 가능"
ON public.board_posts FOR SELECT USING (true);

CREATE POLICY "게시글 작성은 로그인된 관리자/권한자"
ON public.board_posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "게시글 수정/삭제는 작성자 본인 또는 관리자"
ON public.board_posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "게시글 삭제"
ON public.board_posts FOR DELETE USING (auth.uid() = author_id);

-- 4. 업데이트 트리거 설정 
-- (업데이트 시 시간을 자동 갱신해주는 트리거)
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_boards_modtime
    BEFORE UPDATE ON public.boards
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_board_posts_modtime
    BEFORE UPDATE ON public.board_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- ========================================================
-- [ 댓글 테이블(comments) 호환성 업데이트 ]
-- 기존 뉴스 전용이던 댓글 테이블을 통합 게시판에서도 쓸 수 있게
-- target_type 컬럼 추가 
-- ========================================================
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS target_type VARCHAR(20) DEFAULT 'news';
-- 만약 게시판 댓글을 쓴다면 target_type = 'board', article_id 칼럼에는 board_posts의 id(UUID)를 저장하면 됨.
