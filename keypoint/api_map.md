# 공실뉴스 - 핵심 아키텍처 정리

> 작성일: 2026-04-03  
> 목적: 본격 서비스 런칭 전 핵심 구조와 주의사항 정리

---

## 📌 1. 카카오맵 API 과부하 문제 해결 방법

### 문제
- 지도 페이지를 열 때마다 **모든 매물의 주소 → 좌표 변환(geocoding)**을 카카오 API에 요청
- 매물 100개 × 새로고침 10번 = 카카오 API **1,000번** 소모
- 일일 쿼터(약 30만 건 무료) 초과 시 → **429 에러 → 지도 및 매물 전혀 안보임**

### 해결책: 좌표 DB 저장
매물 주소를 **한 번만** 좌표로 변환해서 `properties` 테이블의 `lat`, `lng` 컬럼에 저장.  
이후 지도 로딩 시에는 저장된 좌표를 바로 사용 → **카카오 API 호출 0번**

```
[매물 등록 시] 주소 → 카카오 geocoding → lat/lng 저장 (1번)
[지도 로딩 시] DB에서 lat/lng 바로 읽음 (0번)
```

---

## 📌 2. Supabase DB 설정

### 필수 SQL (이미 실행 완료)
```sql
ALTER TABLE properties ADD COLUMN IF NOT EXISTS lat numeric(15,10);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS lng numeric(15,10);
```

### properties 테이블 주요 컬럼
| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| `lat` | numeric(15,10) | 위도 (카카오 geocoding으로 저장) |
| `lng` | numeric(15,10) | 경도 (카카오 geocoding으로 저장) |
| `sido` | varchar | 시/도 (예: 서울특별시) |
| `sigungu` | varchar | 시/군/구 |
| `dong` | varchar | 법정동 |
| `status` | varchar | 'active' = 노출, 'pending' = 대기 |

---

## 📌 3. 좌표 저장 자동화 흐름

### ① 기존 매물 일괄 저장 (최초 1회)
`geocode_tool.html` 에서 실행  
URL: `https://gongsilnews-bit.github.io/geocode_tool.html`

- 이미 `lat/lng`가 있는 매물은 **자동 스킵**
- 100ms 간격으로 순차 처리 (API 속도 제한 방지)

### ② 신규 매물 등록 시 자동 저장 (admin.html)
**엑셀 대량 업로드 시** 자동으로 geocoding 후 `lat/lng` 포함해서 insert  
→ 담당 파일: `admin.html`

```
엑셀 업로드 → 주소 추출 → 카카오 geocoding → lat/lng 포함 DB insert
```

### ③ 개별 매물 등록 시 (미래 작업 필요)
현재 개별 등록 UI가 있다면 동일하게 geocoding 추가 필요

---

## 📌 4. 관련 파일 구조

```
test/
├── index.html              # 메인 홈 지도 (좌표 있으면 geocoding 스킵 ✅)
├── gongsil/
│   └── index.html          # 공실열람 지도 (좌표 있으면 geocoding 스킵 ✅)
├── admin.html              # 엑셀 대량 업로드 (등록 시 자동 geocoding ✅)
├── geocode_tool.html       # 기존 매물 일괄 좌표 저장 툴 (1회 실행용)
└── keypoint/
    └── README.md           # 이 문서
```

---

## 📌 5. 카카오 API 키 정보

| 용도 | 키 |
|------|----|
| 지도 표시 + geocoding | `435d3602201a49ea712e5f5a36fe6efc` |

> ⚠️ 키는 공개 저장소에 올라가 있으므로, 카카오 개발자 콘솔에서  
> **허용 도메인을 `gongsilnews-bit.github.io`로만 제한** 해두면 무단 사용 방지 가능

---

## 📌 6. 주의사항 및 체크리스트

- [ ] `geocode_tool.html` 최초 1회 실행하여 기존 매물 좌표 저장
- [ ] 카카오 개발자 콘솔 → 허용 도메인 제한 설정
- [ ] 향후 개별 매물 등록 폼(register.html 등)에도 geocoding 자동화 추가
- [ ] Supabase 무료 플랜 한도 모니터링 (월 50만 요청)

---

## 📌 7. 오류 대응

| 오류 | 원인 | 해결 |
|------|------|------|
| 429 에러 (지도 안보임) | 카카오 API 일일 쿼터 초과 | 자정 이후 자동 리셋됨 |
| 매물 마커 안보임 | `lat/lng` 미저장 | geocode_tool.html 실행 |
| 지도 아예 안뜸 | 카카오 SDK 로딩 실패 | 허용 도메인 확인 |
