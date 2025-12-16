import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env 파일 로드
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const CAFE_KEY = "LOCALDATA_072405";
const FOOD_KEY = "LOCALDATA_072404";

const 영업중 = "01";
const 평수100 = 330.58; // 100평 = 330.58m2

function buildUrl(key, start, end) {
  return `http://openapi.seoul.go.kr:8088/${process.env.SEOUL_OPEN_API_KEY}/json/${key}/${start}/${end}/`;
}

async function fetchAllData(key) {
  const items = [];
  let start = 1;
  const pageSize = 1000;

  // 첫 요청으로 전체 개수 파악
  const initialUrl = buildUrl(key, 1, 1);
  const initialResponse = await fetch(initialUrl);
  const initialData = await initialResponse.json();

  if (!initialData[key]) {
    console.error(`데이터를 가져올 수 없습니다: ${key}`);
    return items;
  }

  const totalCount = initialData[key].list_total_count;
  console.log(`[${key}] 전체 데이터 수: ${totalCount}`);

  // 1000개씩 페이지네이션하여 모든 데이터 가져오기
  while (start <= totalCount) {
    const end = Math.min(start + pageSize - 1, totalCount);
    const url = buildUrl(key, start, end);

    console.log(`[${key}] ${start} ~ ${end} 요청 중...`);

    const response = await fetch(url);
    const data = await response.json();

    if (data[key] && data[key].row) {
      for (const item of data[key].row) {
        items.push(item);
      }
    }

    start += pageSize;
  }

  return items;
}

function filterLargeCafes(items, key) {
  const filtered = [];

  for (const item of items) {
    const siteArea = Number(item.SITEAREA);
    const isOpen = item.TRDSTATEGBN === 영업중;
    const isLarge = siteArea && siteArea >= 평수100;

    // CAFE_KEY: 휴게음식점 (카페)
    // FOOD_KEY: 일반음식점 중 "기타" 또는 "까페" 업종
    let shouldInclude = false;

    if (key === CAFE_KEY) {
      shouldInclude = isOpen && isLarge;
    } else if (key === FOOD_KEY) {
      const isCafeType = item.UPTAENM === "기타" || item.UPTAENM === "까페";
      shouldInclude = isOpen && isLarge && isCafeType;
    }

    if (shouldInclude) {
      filtered.push({
        BPLCNM: item.BPLCNM, // 사업장명
        SITEAREA: item.SITEAREA, // 면적
        X: item.X.trim(), // 경도
        Y: item.Y.trim(), // 위도
        UPTAENM: item.UPTAENM, // 업태구분명
      });
    }
  }

  return filtered;
}

async function main() {
  console.log("=== 대형카페 데이터 수집 시작 ===\n");

  // 휴게음식점(카페) 데이터 수집
  console.log("1. 휴게음식점(카페) 데이터 수집 중...");
  const cafeItems = await fetchAllData(CAFE_KEY);
  const filteredCafes = filterLargeCafes(cafeItems, CAFE_KEY);
  console.log(`   -> 100평 이상 영업중 카페: ${filteredCafes.length}개\n`);

  // 일반음식점(기타/까페) 데이터 수집
  console.log("2. 일반음식점(기타/까페) 데이터 수집 중...");
  const foodItems = await fetchAllData(FOOD_KEY);
  const filteredFoods = filterLargeCafes(foodItems, FOOD_KEY);
  console.log(`   -> 100평 이상 영업중 카페: ${filteredFoods.length}개\n`);

  // 결과 합치기
  const allLargeCafes = [...filteredCafes, ...filteredFoods];
  console.log(`=== 총 대형카페 수: ${allLargeCafes.length}개 ===\n`);

  // JSON 파일로 저장
  const outputPath = path.join(__dirname, "..", "대형카페_list.json");
  fs.writeFileSync(outputPath, JSON.stringify(allLargeCafes, null, 2), "utf-8");
  console.log(`✅ 파일 저장 완료: ${outputPath}`);
}

main().catch(console.error);
