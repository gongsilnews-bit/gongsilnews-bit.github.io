# 뷰포트 로딩 (Viewport Loading)

> 작성일: 2026-04-03  
> 목적: 본격 서비스 확장 시 지도 성능 최적화 방안 메모

---

## 📌 개념

지도에서 **현재 화면에 보이는 영역(뷰포트)의 매물만** DB에서 조회하는 방식.

```
현재 방식: 접속 → 전체 매물 N만개 전부 로딩
뷰포트 방식: 접속 → 현재 화면 안 매물만 로딩 → 지도 이동 시 새 범위 재조회
```

직방, 네이버 부동산이 사용하는 방식.

---

## 📌 현재 공실뉴스 상태 (2026-04-03 기준)

| 항목 | 상태 |
|------|------|
| 지도 마커 | 전체 로딩 (뷰포트 미적용) |
| 좌측 매물 리스트 | ✅ 뷰포트 필터링 적용 중 (`updateListByMapBounds`) |
| 좌표 DB 저장 | ✅ `lat`, `lng` 컬럼 저장 완료 |

> 이미 `lat/lng`가 DB에 저장되어 있어 **기반은 완성**된 상태.

---

## 📌 적용 시점

| 매물 수 | 권장 방식 |
|---------|----------|
| ~500개 | 현재 구조로 충분 |
| 500~3,000개 | 클러스터링 + 좌표 DB 저장으로 OK |
| **3,000개 이상** | **뷰포트 로딩 적용 권장** |

---

## 📌 구현 방법 (난이도: ★★☆☆☆)

### 1. Supabase에 인덱스 추가 (SQL 1회 실행)

```sql
CREATE INDEX idx_properties_lat ON properties(lat);
CREATE INDEX idx_properties_lng ON properties(lng);
```

### 2. DB 조회 쿼리 변경

**현재:**
```javascript
const { data } = await supabase
    .from('properties')
    .select('*')
    .eq('status', 'active');
```

**뷰포트 로딩 적용 후:**
```javascript
const bounds = map.getBounds();
const { data } = await supabase
    .from('properties')
    .select('*')
    .eq('status', 'active')
    .gte('lat', bounds.getSouthWest().getLat())
    .lte('lat', bounds.getNorthEast().getLat())
    .gte('lng', bounds.getSouthWest().getLng())
    .lte('lng', bounds.getNorthEast().getLng());
```

### 3. 지도 이동 이벤트 연결

```javascript
// 지도 이동이 멈췄을 때 재조회 (idle = 이동 완료 시점)
kakao.maps.event.addListener(map, 'idle', fetchByViewport);
```

### 4. 수정 대상 파일

- `gongsil/index.html` → `addMarkersToMap` 함수
- `index.html` → 메인 홈 매물 로딩 함수

---

## 📌 비용 영향

| 항목 | 현재 | 뷰포트 로딩 |
|------|------|------------|
| 카카오 API | 변화 없음 | 변화 없음 |
| Supabase 쿼리 수 | 접속 시 1번 | 지도 이동마다 1번 |
| Supabase 데이터 전송량 | 전체 N만건 | 화면 안 200~300건만 |
| **결론** | - | **비용 절감 + 속도 향상** |

---

## 📌 주의사항

- 뷰포트 로딩 적용 시 **기존 클러스터링 로직 수정 필요**
- `idle` 이벤트가 너무 자주 발생하면 **디바운스(debounce)** 처리 필요
  ```javascript
  // 이동 후 300ms 지났을 때만 조회 (과도한 요청 방지)
  let debounceTimer;
  kakao.maps.event.addListener(map, 'idle', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(fetchByViewport, 300);
  });
  ```
