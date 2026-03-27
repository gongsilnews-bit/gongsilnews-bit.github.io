-- ════════════════════════════════════════
-- 포토DB: user_photos 테이블 생성
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.user_photos (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    url          text NOT NULL,
    filename     text NOT NULL DEFAULT '',
    file_size    bigint DEFAULT 0,
    tags         text[] DEFAULT '{}',
    description  text DEFAULT '',
    is_favorite  boolean DEFAULT false,
    used_count   integer DEFAULT 0,
    created_at   timestamptz DEFAULT now()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_user_photos_user_id ON public.user_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_user_photos_created_at ON public.user_photos(created_at DESC);

-- RLS 활성화
ALTER TABLE public.user_photos ENABLE ROW LEVEL SECURITY;

-- 본인 사진만 조회
CREATE POLICY "user_photos_select_own"
    ON public.user_photos FOR SELECT
    USING (auth.uid() = user_id);

-- 본인 사진만 삽입
CREATE POLICY "user_photos_insert_own"
    ON public.user_photos FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 본인 사진만 수정
CREATE POLICY "user_photos_update_own"
    ON public.user_photos FOR UPDATE
    USING (auth.uid() = user_id);

-- 본인 사진만 삭제
CREATE POLICY "user_photos_delete_own"
    ON public.user_photos FOR DELETE
    USING (auth.uid() = user_id);


-- ════════════════════════════════════════
-- Storage 버킷 생성 (Supabase 대시보드에서도 가능)
-- ════════════════════════════════════════
-- 참고: Supabase Storage 버킷은 SQL로 직접 생성하거나 대시보드에서 생성합니다.
-- 아래는 storage 스키마의 objects 테이블에 RLS 정책을 추가하는 SQL입니다.

-- 1) Supabase 대시보드 → Storage → New Bucket
--    이름: user-photos
--    Public: OFF (비공개, signed URL 사용)

-- 2) Storage 정책 (SQL Editor에서 실행)
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-photos', 'user-photos', false)
ON CONFLICT (id) DO NOTHING;

-- 업로드: 본인 폴더에만
CREATE POLICY "user_photos_storage_insert"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'user-photos'
        AND auth.uid()::text = (string_to_array(name, '/'))[1]
    );

-- 조회: 본인 폴더에만
CREATE POLICY "user_photos_storage_select"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'user-photos'
        AND auth.uid()::text = (string_to_array(name, '/'))[1]
    );

-- 삭제: 본인 폴더에만
CREATE POLICY "user_photos_storage_delete"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'user-photos'
        AND auth.uid()::text = (string_to_array(name, '/'))[1]
    );
