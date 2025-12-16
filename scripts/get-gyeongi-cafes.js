import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env 파일 로드
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const BASE_URL = "https://openapi.gg.go.kr/RESRESTRT";

function buildUrl(pIndex, pSize = 1000) {
  const searchParams = new URLSearchParams({
    Key: process.env.GYEONGI_OPEN_API_KEY,
    Type: "json",
    pIndex: pIndex,
    pSize: pSize,
  });
  return `${BASE_URL}?${searchParams.toString()}`;
}

async function fetchAllData() {
  const items = [];
  let pIndex = 1;
  const pageSize = 1000;

  // 첫 요청으로 전체 개수 파악
  const initialUrl = buildUrl(1, 1);
  const initialResponse = await fetch(initialUrl);
  const initialData = await initialResponse.json();

  if (!initialData.RESRESTRT || !initialData.RESRESTRT[0]) {
    console.error("데이터를 가져올 수 없습니다");
    console.log(initialData);
    return items;
  }

  const totalCount = initialData.RESRESTRT[0].head[0].list_total_count;
  console.log(`전체 데이터 수: ${totalCount}`);

  // 1000개씩 페이지네이션하여 모든 데이터 가져오기
  while ((pIndex - 1) * pageSize < totalCount) {
    const url = buildUrl(pIndex, pageSize);
    const start = (pIndex - 1) * pageSize + 1;
    const end = Math.min(pIndex * pageSize, totalCount);

    console.log(`${start} ~ ${end} 요청 중...`);

    const response = await fetch(url);
    const data = await response.json();

    if (data.RESRESTRT && data.RESRESTRT[1] && data.RESRESTRT[1].row) {
      for (const item of data.RESRESTRT[1].row) {
        items.push(item);
      }
    }

    pIndex++;
  }

  return items;
}

function filterLargeCafes(items) {
  const filtered = [];

  for (const item of items) {
    const siteArea = Number(item.LOCPLC_AR_INFO);
    const isOpen = item.BSN_STATE_NM === "영업";
    const isLarge = siteArea && siteArea >= 100;

    // 휴게음식점 중 카페 관련 업종 필터링
    const bizType = item.SANITTN_BIZCOND_NM || item.BIZCOND_DIV_NM_INFO || "";
  


    if (isOpen && isLarge) {
      filtered.push({
        BPLCNM: item.BIZPLC_NM, // 사업장명
        SITEAREA: item.LOCPLC_AR_INFO, // 면적
        X: item.X_CRDNT_VL, // 경도 (WGS84)
        Y: item.Y_CRDNT_VL, // 위도 (WGS84)
        UPTAENM: bizType, // 업종명
      });
    }
  }

  return filtered;
}

async function main() {
  console.log("=== 경기도 대형카페 데이터 수집 시작 ===\n");

  const allItems = await fetchAllData();
  console.log(`\n수집된 전체 데이터: ${allItems.length}개`);

  const filteredCafes = filterLargeCafes(allItems);
  console.log(`100평 이상 영업중 카페: ${filteredCafes.length}개\n`);

  // JSON 파일로 저장
  const outputPath = path.join(__dirname, "..", "경기_대형카페_list.json");
  fs.writeFileSync(outputPath, JSON.stringify(filteredCafes, null, 2), "utf-8");
  console.log(`✅ 파일 저장 완료: ${outputPath}`);
}

main().catch(console.error);
