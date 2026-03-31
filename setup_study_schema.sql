-- 공실스터디 데이터베이스 스키마 초안 (포인트 결제 제외)

-- 1. 스터디(강의) 기본 정보 테이블
CREATE TABLE IF NOT EXISTS public.study_courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instructor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    price INTEGER DEFAULT 0, -- 스터디 가격 (현재는 표시용, 시스템 연동 전)
    status VARCHAR(50) DEFAULT 'draft', -- draft(임시저장), published(모집중/판매중), hidden(숨김)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS & Policies for study_courses
ALTER TABLE public.study_courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published courses" ON public.study_courses FOR SELECT USING (status = 'published');
CREATE POLICY "Instructors can view their own courses" ON public.study_courses FOR SELECT USING (auth.uid() = instructor_id);
CREATE POLICY "Instructors can create courses" ON public.study_courses FOR INSERT WITH CHECK (auth.uid() = instructor_id);
CREATE POLICY "Instructors can update their own courses" ON public.study_courses FOR UPDATE USING (auth.uid() = instructor_id);

-- 2. 스터디 커리큘럼(목차 및 영상) 테이블
CREATE TABLE IF NOT EXISTS public.study_lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES public.study_courses(id) ON DELETE CASCADE,
    section_title VARCHAR(255) NOT NULL, -- 예: "1. 오리엔테이션 및 기초 이론"
    lesson_title VARCHAR(255) NOT NULL,  -- 예: "제 1강. 강사 소개 및 오리엔테이션"
    video_url TEXT,                      -- 비메오, 유튜브 등 VOD 링크
    duration_seconds INTEGER DEFAULT 0,  -- 영상 길이(초 단위)
    order_index INTEGER NOT NULL DEFAULT 0, -- 정렬 순서 (1, 2, 3...)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for study_lessons
ALTER TABLE public.study_lessons ENABLE ROW LEVEL SECURITY;
-- 공개 여부는 보안이 중요하지만 1차적으로는 모두 읽기 가능 (앱단 또는 SQL 함수에서 구매여부 필터링 권장)
CREATE POLICY "Instructors can manage their lessons" ON public.study_lessons
    USING (auth.uid() IN (SELECT instructor_id FROM public.study_courses WHERE id = course_id));
CREATE POLICY "Authenticated users can view lessons" ON public.study_lessons FOR SELECT USING (auth.role() = 'authenticated');

-- 3. 스터디 실무 자료(첨부파일) 테이블
CREATE TABLE IF NOT EXISTS public.study_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES public.study_courses(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.study_lessons(id) ON DELETE CASCADE, -- 특정 회차에만 속한 자료일 경우 사용
    title VARCHAR(255) NOT NULL,         -- 예: "상가 임대차 특약 모음집.pdf"
    file_url TEXT NOT NULL,              -- Supabase Storage 등 파일 위치 링크
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for study_materials
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Instructors can manage materials" ON public.study_materials
    USING (auth.uid() IN (SELECT instructor_id FROM public.study_courses WHERE id = course_id));
CREATE POLICY "Authenticated users can view materials" ON public.study_materials FOR SELECT USING (auth.role() = 'authenticated');

-- 4. 수강생(등록) 테이블
CREATE TABLE IF NOT EXISTS public.study_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES public.study_courses(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'active', -- active(수강중/활성), expired(수강기한만료)
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE, -- 수강 기한 (예: 1개월 수강권)
    UNIQUE(course_id, student_id)        -- 한 유저가 같은 강의 중복 등록 방지
);

-- RLS for study_enrollments
ALTER TABLE public.study_enrollments ENABLE ROW LEVEL SECURITY;
-- 학생 본인은 내 수강 내역 조회 가능
CREATE POLICY "Students can view their own enrollments" ON public.study_enrollments FOR SELECT USING (auth.uid() = student_id);
-- 강사는 내 강의를 듣는 학생 목록 모두 조회 가능 (관리자 대시보드용)
CREATE POLICY "Instructors can view their students" ON public.study_enrollments FOR SELECT
    USING (auth.uid() IN (SELECT instructor_id FROM public.study_courses WHERE id = course_id));
-- 개발 목적으로는 일단 insert 정책도 본인에게 허용해 둡니다 (포인트 결제 없이 "무료수강" 클릭 시 바로 등록)
CREATE POLICY "Students can enroll themselves" ON public.study_enrollments FOR INSERT WITH CHECK (auth.uid() = student_id);


-- 5. 1:1 Q&A (방(스레드) + 실제 내용(메시지) 분리형 채널)
CREATE TABLE IF NOT EXISTS public.study_qna_threads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES public.study_courses(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'open', -- open(답변 대기중), closed(답변 완료)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.study_qna_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id UUID NOT NULL REFERENCES public.study_qna_threads(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for QnA Threads
ALTER TABLE public.study_qna_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can view their threads" ON public.study_qna_threads FOR SELECT
    USING (auth.uid() = student_id OR auth.uid() IN (SELECT instructor_id FROM public.study_courses WHERE id = course_id));
CREATE POLICY "Students can create threads" ON public.study_qna_threads FOR INSERT WITH CHECK (auth.uid() = student_id);

-- RLS for QnA Messages
ALTER TABLE public.study_qna_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can view their messages" ON public.study_qna_messages FOR SELECT
    USING (
        auth.uid() IN (SELECT student_id FROM public.study_qna_threads WHERE id = thread_id) OR
        auth.uid() IN (SELECT instructor_id FROM public.study_courses WHERE id = (SELECT course_id FROM public.study_qna_threads WHERE id = thread_id))
    );
CREATE POLICY "Participants can insert messages" ON public.study_qna_messages FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id AND (
            auth.uid() IN (SELECT student_id FROM public.study_qna_threads WHERE id = thread_id) OR
            auth.uid() IN (SELECT instructor_id FROM public.study_courses WHERE id = (SELECT course_id FROM public.study_qna_threads WHERE id = thread_id))
        )
    );
