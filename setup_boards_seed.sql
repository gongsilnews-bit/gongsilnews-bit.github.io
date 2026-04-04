-- ========================================================
-- [ 기본 3개 게시판 초기 생성(Seeding) 스크립트 ]
-- ========================================================
-- 방금 생성하신 boards 테이블에 기본 껍데기 3개를 넣어줍니다.

INSERT INTO public.boards (board_id, board_name, subtitle, skin_type, categories)
VALUES 
    -- 1. 드론영상 자료실 (video_album 스킨)
    ('bbs_drone', '드론 영상', '자료실', 'video_album', '전체,드론,아파트,상가'),
    
    -- 2. 계약서/양식 자료실 (file_album 스킨)
    ('bbs_form', '계약서/양식', '문서자료실', 'file_album', '전체,표준양식,내부서류'),
    
    -- 3. 일반 자유게시판 (default_bbs 스킨)
    ('bbs_free', '자유게시판', '커뮤니티', 'default_bbs', '전체,질문,홍보,잡담')
ON CONFLICT (board_id) DO NOTHING;
