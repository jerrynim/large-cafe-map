# 대형카페 지도

서울/경기 지역의 대형카페(100㎡ 이상)를 지도에서 찾아볼 수 있는 웹 앱입니다.

## 기능

- 현재 위치 기반 10km 내 대형카페 표시
- 지도 드래그 후 "현재 위치에서 검색하기" 버튼으로 재검색
- 마커 클릭 시 카페 상세정보 확인
- 네이버 지도로 바로 이동 가능한 링크 제공

## 기술 스택

- React 19 + TypeScript
- Vite
- Naver Maps API v3
- Base UI

## 설치 및 실행

### 1. 패키지 설치

```bash
pnpm install
```

### 2. 환경변수 설정

`.env` 파일에 네이버 지도 API 키를 설정합니다:

```env
VITE_NAVER_MAPS_ID=your_ncp_key_id
```

> 네이버 클라우드 플랫폼에서 Maps API 키를 발급받으세요: https://www.ncloud.com/product/applicationService/maps

### 3. 개발 서버 실행

```bash
pnpm run dev
```

http://localhost:5173 에서 확인할 수 있습니다.

### 4. 빌드

```bash
pnpm run build
```

## 스크립트

| 명령어 | 설명 |
|--------|------|
| `pnpm run dev` | 개발 서버 실행 |
| `pnpm run build` | 프로덕션 빌드 |
| `pnpm run preview` | 빌드 결과 미리보기 |
| `pnpm run convert-coords` | TM → WGS84 좌표 변환 |

## 데이터

- **데이터 소스**: 공공데이터포털 지방행정인허가데이터 (휴게음식점)
- **수집 조건**: 면적 100㎡ 이상, 영업중인 카페
- **총 카페 수**: 2,152개 (서울 146개, 경기 2,006개)

## 프로젝트 구조

```
cafe-map/
├── src/
│   ├── components/
│   │   ├── NaverMap.tsx       # 네이버 지도 + 마커 렌더링
│   │   ├── SearchButton.tsx   # 현재 위치에서 검색하기 버튼
│   │   └── CafeDetail.tsx     # 상세정보 하단 시트
│   ├── utils/
│   │   └── geo.ts             # Haversine 거리 계산
│   ├── data/
│   │   └── cafes.json         # 변환된 카페 데이터 (WGS84)
│   ├── App.tsx
│   ├── main.tsx
│   └── types.ts
├── scripts/
│   ├── convert-coordinates.js # TM → WGS84 좌표 변환
│   ├── get-seoul-cafes.js     # 서울 데이터 수집
│   ├── get-gyeongi-cafes.js   # 경기 데이터 수집
│   ├── filter-cafes.js        # 패턴 기반 필터링
│   └── verify-cafes-naver.js  # 네이버 API 검증
└── 대형카페_final.json        # 원본 데이터 (TM 좌표)
```

## 라이선스

MIT
