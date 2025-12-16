import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

// Naver API 설정
const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;
const API_URL = "https://openapi.naver.com/v1/search/local.json";

// 카페로 판단할 카테고리 키워드
const CAFE_CATEGORY_KEYWORDS = [
  "카페",
  "커피",
  "디저트",
  "베이커리",
  "빵",
  "케이크",
  "베이글",
  "도넛",
  "마카롱",
  "차",
  "티",
  "음료",
  "브런치",
  "샌드위치",
  "토스트",
  "와플",
  "쿠키",
  "제과",
];

// 확실히 카페가 아닌 카테고리
const NON_CAFE_CATEGORY_KEYWORDS = [
  "음식점",
  "한식",
  "중식",
  "일식",
  "양식",
  "분식",
  "패스트푸드",
  "치킨",
  "피자",
  "족발",
  "보쌈",
  "삼겹살",
  "갈비",
  "곱창",
  "국밥",
  "냉면",
  "칼국수",
  "라멘",
  "우동",
  "짜장면",
  "짬뽕",
  "초밥",
  "회",
  "술집",
  "호프",
  "주점",
  "바",
  "클럽",
  "노래방",
  "PC방",
  "게임",
  "당구",
  "볼링",
  "골프",
  "헬스",
  "미용",
  "네일",
  "스파",
  "마사지",
  "병원",
  "약국",
  "은행",
  "보험",
  "부동산",
  "학원",
  "어린이집",
  "유치원",
  "마트",
  "편의점",
  "세탁",
  "수선",
  "철물",
  "인테리어",
  "가구",
  "전자",
  "휴대폰",
  "자동차",
  "주유소",
  "세차",
  "공장",
  "창고",
];

// API 호출
async function searchNaver(query) {
  const encodedQuery = encodeURIComponent(query);
  const url = `${API_URL}?query=${encodedQuery}&display=5&start=1&sort=random`;

  const response = await fetch(url, {
    headers: {
      "X-Naver-Client-Id": NAVER_CLIENT_ID,
      "X-Naver-Client-Secret": NAVER_CLIENT_SECRET,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

// 카테고리로 카페 여부 판단
function isCafeCategory(category) {
  if (!category) return null; // 판단 불가

  const lowerCategory = category.toLowerCase();

  // 카페 카테고리 키워드 체크
  for (const keyword of CAFE_CATEGORY_KEYWORDS) {
    if (lowerCategory.includes(keyword)) {
      return true;
    }
  }

  // 비카페 카테고리 키워드 체크
  for (const keyword of NON_CAFE_CATEGORY_KEYWORDS) {
    if (lowerCategory.includes(keyword)) {
      return false;
    }
  }

  return null; // 판단 불가
}

// 딜레이 함수
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 메인 함수
async function main() {
  // 검토필요 파일 읽기
  const seoulToReview = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "..", "filtered", "서울_검토필요.json"),
      "utf-8"
    )
  );
  const gyeonggiToReview = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "..", "filtered", "경기_검토필요.json"),
      "utf-8"
    )
  );

  const allToReview = [
    ...seoulToReview.map((x) => ({ ...x, region: "서울" })),
    ...gyeonggiToReview.map((x) => ({ ...x, region: "경기" })),
  ];

  console.log(`총 검토 대상: ${allToReview.length}개`);

  // 결과 저장용
  const results = {
    confirmed_cafe: [], // 카페 확정
    confirmed_non_cafe: [], // 비카페 확정
    unknown: [], // 판단 불가 (검색 결과 없음 또는 카테고리 불명확)
  };

  // 진행상황 저장 파일 (중간에 중단해도 이어서 할 수 있도록)
  const progressFile = path.join(
    __dirname,
    "..",
    "filtered",
    "verify_progress.json"
  );
  let startIndex = 0;

  // 기존 진행상황 불러오기
  if (fs.existsSync(progressFile)) {
    const progress = JSON.parse(fs.readFileSync(progressFile, "utf-8"));
    results.confirmed_cafe = progress.confirmed_cafe || [];
    results.confirmed_non_cafe = progress.confirmed_non_cafe || [];
    results.unknown = progress.unknown || [];
    startIndex = progress.lastIndex || 0;
    console.log(`이전 진행상황 불러옴. ${startIndex}번부터 재시작...`);
  }

  // API 호출 및 분류
  for (let i = startIndex; i < allToReview.length; i++) {
    const item = allToReview[i];
    const name = item.BPLCNM;

    try {
      // 네이버 검색
      const searchResult = await searchNaver(name);

      if (searchResult.items && searchResult.items.length > 0) {
        // 첫 번째 결과의 카테고리 확인
        const firstItem = searchResult.items[0];
        const category = firstItem.category;
        const isCafe = isCafeCategory(category);

        if (isCafe === true) {
          results.confirmed_cafe.push({
            ...item,
            naverCategory: category,
            naverTitle: firstItem.title.replace(/<[^>]*>/g, ""),
          });
          console.log(`[${i + 1}/${allToReview.length}] ✅ 카페: ${name} (${category})`);
        } else if (isCafe === false) {
          results.confirmed_non_cafe.push({
            ...item,
            naverCategory: category,
            naverTitle: firstItem.title.replace(/<[^>]*>/g, ""),
          });
          console.log(`[${i + 1}/${allToReview.length}] ❌ 비카페: ${name} (${category})`);
        } else {
          results.unknown.push({
            ...item,
            naverCategory: category,
            naverTitle: firstItem.title.replace(/<[^>]*>/g, ""),
            reason: "카테고리 판단 불가",
          });
          console.log(`[${i + 1}/${allToReview.length}] ❓ 불명확: ${name} (${category})`);
        }
      } else {
        // 검색 결과 없음
        results.unknown.push({
          ...item,
          naverCategory: null,
          naverTitle: null,
          reason: "검색 결과 없음",
        });
        console.log(`[${i + 1}/${allToReview.length}] ❓ 검색결과없음: ${name}`);
      }
    } catch (error) {
      console.error(`[${i + 1}/${allToReview.length}] ⚠️ 오류: ${name} - ${error.message}`);
      results.unknown.push({
        ...item,
        naverCategory: null,
        naverTitle: null,
        reason: `API 오류: ${error.message}`,
      });
    }

    // 진행상황 저장 (100개마다)
    if ((i + 1) % 100 === 0) {
      fs.writeFileSync(
        progressFile,
        JSON.stringify({ ...results, lastIndex: i + 1 }, null, 2),
        "utf-8"
      );
      console.log(`\n--- 진행상황 저장됨 (${i + 1}/${allToReview.length}) ---\n`);
    }

    // Rate limit 대응 (초당 10회 제한, 안전하게 150ms 딜레이)
    await delay(150);
  }

  // 최종 결과 저장
  const outputDir = path.join(__dirname, "..", "filtered");

  fs.writeFileSync(
    path.join(outputDir, "verified_카페확정.json"),
    JSON.stringify(results.confirmed_cafe, null, 2),
    "utf-8"
  );
  fs.writeFileSync(
    path.join(outputDir, "verified_비카페확정.json"),
    JSON.stringify(results.confirmed_non_cafe, null, 2),
    "utf-8"
  );
  fs.writeFileSync(
    path.join(outputDir, "verified_판단불가.json"),
    JSON.stringify(results.unknown, null, 2),
    "utf-8"
  );

  // 진행상황 파일 삭제
  if (fs.existsSync(progressFile)) {
    fs.unlinkSync(progressFile);
  }

  console.log("\n=== 검증 완료 ===");
  console.log(`카페 확정: ${results.confirmed_cafe.length}개`);
  console.log(`비카페 확정: ${results.confirmed_non_cafe.length}개`);
  console.log(`판단 불가: ${results.unknown.length}개`);

  // === 최종 파일 생성 ===
  console.log("\n=== 최종 파일 생성 중... ===");

  // 카페 확정 목록에서 region별로 분리
  const seoulCafes = results.confirmed_cafe
    .filter((x) => x.region === "서울")
    .map(({ region, naverCategory, naverTitle, ...rest }) => rest);

  const gyeonggiCafes = results.confirmed_cafe
    .filter((x) => x.region === "경기")
    .map(({ region, naverCategory, naverTitle, ...rest }) => rest);

  // 서울_대형카페.json
  const seoulFinalPath = path.join(__dirname, "..", "서울_대형카페.json");
  fs.writeFileSync(seoulFinalPath, JSON.stringify(seoulCafes, null, 2), "utf-8");
  console.log(`서울_대형카페.json: ${seoulCafes.length}개`);

  // 경기_대형카페.json
  const gyeonggiFinalPath = path.join(__dirname, "..", "경기_대형카페.json");
  fs.writeFileSync(gyeonggiFinalPath, JSON.stringify(gyeonggiCafes, null, 2), "utf-8");
  console.log(`경기_대형카페.json: ${gyeonggiCafes.length}개`);

  // 대형카페_final.json (통합)
  const allCafes = results.confirmed_cafe.map(
    ({ region, naverCategory, naverTitle, ...rest }) => ({
      ...rest,
      region,
    })
  );
  const finalPath = path.join(__dirname, "..", "대형카페_final.json");
  fs.writeFileSync(finalPath, JSON.stringify(allCafes, null, 2), "utf-8");
  console.log(`대형카페_final.json: ${allCafes.length}개 (통합)`);

  console.log("\n=== 모든 작업 완료! ===");
  console.log(`\n최종 결과:`);
  console.log(`- 서울_대형카페.json (${seoulCafes.length}개)`);
  console.log(`- 경기_대형카페.json (${gyeonggiCafes.length}개)`);
  console.log(`- 대형카페_final.json (${allCafes.length}개)`);
  console.log(`\n검증 중간 파일:`);
  console.log(`- verified_카페확정.json`);
  console.log(`- verified_비카페확정.json`);
  console.log(`- verified_판단불가.json`);
}

main().catch(console.error);
