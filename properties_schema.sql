-- ============================================================
--  공실뉴스 부동산 - 매물(properties) 테이블 스키마 v3.0
--  기존 테이블 완전 삭제 후 새로 생성
-- ============================================================

-- 1. 기존 테이블 삭제 (의존성 순서 고려)
DROP TABLE IF EXISTS public.properties CASCADE;


-- 2. 새 테이블 생성
CREATE TABLE public.properties (

    -- ── 기본 식별자 ───────────────────────────────────────────
    id              uuid            DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at      timestamptz     NOT NULL DEFAULT now(),
    updated_at      timestamptz     NOT NULL DEFAULT now(),

    -- ── 등록자 정보 ───────────────────────────────────────────
    user_id         uuid            REFERENCES auth.users(id) ON DELETE SET NULL,
    user_role       text            NOT NULL DEFAULT 'general'
                                    CHECK (user_role IN ('general', 'realtor', 'admin')),

    -- ── 매물 분류 (1차 대분류 / 2차 소분류) ──────────────────
    main_category   text            NOT NULL
                                    CHECK (main_category IN (
                                        '아파트·오피스텔',
                                        '빌라·주택',
                                        '원룸·투룸',
                                        '상가·업무·공장·토지',
                                        '분양'
                                    )),
    property_type   text            NOT NULL,
    -- 예시값: 아파트, 아파트분양권, 재건축, 오피스텔, 오피스텔분양권, 재개발
    --         빌라/연립, 단독/다가구, 전원주택, 상가주택
    --         원룸, 투룸
    --         상가, 사무실, 공장/창고, 지식산업센터, 건물, 토지
    --         (분양)아파트, 오피스텔, 빌라, 도시형생활주택, 생활숙박시설, 상가/업무

    -- ── 거래 유형 ─────────────────────────────────────────────
    trade_type      text            NOT NULL
                                    CHECK (trade_type IN ('매매', '전세', '월세', '단기')),

    -- ── 가격 정보 (단위: 만원) ────────────────────────────────
    deposit         integer         NOT NULL DEFAULT 0,   -- 매매가 / 보증금 / 예치금
    monthly_rent    integer         NOT NULL DEFAULT 0,   -- 차임(월세) - 월세/단기만 사용
    maintenance_fee integer         NOT NULL DEFAULT 0,   -- 관리비

    -- ── 면적 정보 (단위: ㎡) ──────────────────────────────────
    supply_area     numeric(8,2)    DEFAULT 0,            -- 공급면적
    dedicated_area  numeric(8,2)    DEFAULT 0,            -- 전용면적

    -- ── 주거용 전용 필드 ──────────────────────────────────────
    room_count      text,                                 -- 방 개수 (1, 2, 3, 4+)
    bathroom_count  text,                                 -- 욕실 개수 (1, 2, 3+)

    -- ── 상업/업무용 전용 필드 ────────────────────────────────
    current_floor   integer,                              -- 해당층
    total_floor     integer,                              -- 전체층

    -- ── 위치/주소 ─────────────────────────────────────────────
    sido            text            NOT NULL,               -- 시/도
    sigungu         text            NOT NULL,               -- 시/군/구
    dong            text            NOT NULL,               -- 읍/면/동/리
    detail_address  text,                                   -- 나머지 주소 (도로명+번호)
    building_name   text,                                   -- 건물명 / 단지명
    dong_number     text,                                   -- 동 (예: 101동)
    room_number     text,                                   -- 호수 (예: 101호)
    is_room_private boolean         NOT NULL DEFAULT false,  -- 호수 비공개 여부
    full_address    text,                                   -- 전체 주소 (자동 조합, 검색용)

    -- ── 옵션 / 특징 ───────────────────────────────────────────
    -- 선택된 옵션 배열 저장 (예: ["에어컨","역세권","급매"])
    options         text[]          NOT NULL DEFAULT '{}',

    -- ── 추가 설명 ─────────────────────────────────────────────
    description     text,                                   -- 전달사항 (특징, 입주일 등)

    -- ── 이미지 ────────────────────────────────────────────────
    images          text[]          NOT NULL DEFAULT '{}',  -- Supabase Storage URL 배열

    -- ── 중개보수 지급 ─────────────────────────────────────────
    brokerage_fee   text            NOT NULL,
    -- 예: '공동중개 0%', '물건수수료지급 25%', '물건수수료지급 50%', '물건수수료지급 100%'

    -- ── 노출 선택 ─────────────────────────────────────────────
    exposure_target text            NOT NULL DEFAULT 'all'
                                    CHECK (exposure_target IN ('all', 'realtor_only')),

    -- ── 의뢰인 정보 ───────────────────────────────────────────
    author_name     text            NOT NULL,              -- 의뢰인명
    author_phone    text            NOT NULL,              -- 의뢰인 연락처
    owner_relation  text,                                  -- 소유주와의 관계
    -- 예: 본인, 가족, 대리인, 공인중개사

    -- ── 매물 상태 ─────────────────────────────────────────────
    status          text            NOT NULL DEFAULT 'active'
                                    CHECK (status IN ('active', 'inactive', 'sold', 'deleted')),

    -- ── 광고 관련 ─────────────────────────────────────────────
    agree_promo     boolean         NOT NULL DEFAULT false, -- 광고 동의
    ad_rank         integer         NOT NULL DEFAULT 0,     -- 광고 순위 (높을수록 상단)
    ad_refreshed_at timestamptz                             -- 순위 갱신 일시

);

-- ============================================================
-- 3. 자동 updated_at 트리거
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_properties_updated_at ON public.properties;
CREATE TRIGGER trg_properties_updated_at
    BEFORE UPDATE ON public.properties
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ============================================================
-- 4. 인덱스 (검색 성능)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_properties_user_id      ON public.properties (user_id);
CREATE INDEX IF NOT EXISTS idx_properties_status       ON public.properties (status);
CREATE INDEX IF NOT EXISTS idx_properties_main_cat     ON public.properties (main_category);
CREATE INDEX IF NOT EXISTS idx_properties_type         ON public.properties (property_type);
CREATE INDEX IF NOT EXISTS idx_properties_trade        ON public.properties (trade_type);
CREATE INDEX IF NOT EXISTS idx_properties_sido         ON public.properties (sido);
CREATE INDEX IF NOT EXISTS idx_properties_sigungu      ON public.properties (sigungu);
CREATE INDEX IF NOT EXISTS idx_properties_dong         ON public.properties (dong);
CREATE INDEX IF NOT EXISTS idx_properties_ad_rank      ON public.properties (ad_rank DESC);
CREATE INDEX IF NOT EXISTS idx_properties_created_at   ON public.properties (created_at DESC);


-- ============================================================
-- 5. RLS (Row Level Security) 정책
-- ============================================================
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- 5-1. 누구나 active 상태 매물은 조회 가능
DROP POLICY IF EXISTS "properties_select_active" ON public.properties;
CREATE POLICY "properties_select_active"
    ON public.properties FOR SELECT
    USING (status = 'active');

-- 5-2. 로그인 사용자는 본인 매물 전체 조회 가능
DROP POLICY IF EXISTS "properties_select_own" ON public.properties;
CREATE POLICY "properties_select_own"
    ON public.properties FOR SELECT
    USING (auth.uid() = user_id);

-- 5-3. 로그인 사용자는 INSERT 가능
DROP POLICY IF EXISTS "properties_insert" ON public.properties;
CREATE POLICY "properties_insert"
    ON public.properties FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 5-4. 본인 또는 admin은 UPDATE 가능
DROP POLICY IF EXISTS "properties_update" ON public.properties;
CREATE POLICY "properties_update"
    ON public.properties FOR UPDATE
    USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM public.members m
            WHERE m.id = auth.uid() AND m.role = 'admin'
        )
    );

-- 5-5. 본인 또는 admin은 DELETE 가능
DROP POLICY IF EXISTS "properties_delete" ON public.properties;
CREATE POLICY "properties_delete"
    ON public.properties FOR DELETE
    USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM public.members m
            WHERE m.id = auth.uid() AND m.role = 'admin'
        )
    );


-- ============================================================
-- 6. 컬럼 코멘트 (관리 편의)
-- ============================================================
COMMENT ON TABLE  public.properties                IS '공실뉴스 매물 테이블 v3.0';
COMMENT ON COLUMN public.properties.main_category  IS '1차 대분류 (아파트·오피스텔/빌라·주택/원룸·투룸/상가·업무·공장·토지/분양)';
COMMENT ON COLUMN public.properties.property_type  IS '2차 소분류 (아파트/오피스텔/원룸/빌라연립/상가 등)';
COMMENT ON COLUMN public.properties.options        IS '선택 옵션 배열 (에어컨, 역세권, 급매 등)';
COMMENT ON COLUMN public.properties.images         IS 'Supabase Storage 이미지 URL 배열 (최대 5장)';
COMMENT ON COLUMN public.properties.ad_rank        IS '광고 순위 - 숫자가 클수록 상위 노출';
COMMENT ON COLUMN public.properties.status         IS 'active: 활성, inactive: 비활성, sold: 거래완료, deleted: 삭제';
