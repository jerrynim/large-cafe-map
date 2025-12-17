import fs from "fs";
import path from "path";
import proj4 from "proj4";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// TM 중부원점 좌표계 정의 (EPSG:2097)
const TM_CENTRAL =
  "+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=500000 +ellps=bessel +units=m +no_defs +towgs84=-115.80,474.99,674.11,1.16,-2.31,-1.63,6.43";

// WGS84 좌표계
const WGS84 = "+proj=longlat +datum=WGS84 +no_defs";

// 입력 파일 경로
const inputPath = path.join(__dirname, "..", "대형카페_final.json");
// 출력 파일 경로
const outputPath = path.join(__dirname, "..", "src", "data", "cafes.json");

// src/data 폴더 생성
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 원본 데이터 읽기
const rawData = fs.readFileSync(inputPath, "utf-8");
const cafes = JSON.parse(rawData);

console.log(`총 ${cafes.length}개 카페 좌표 변환 시작...`);

let successCount = 0;
let errorCount = 0;

const convertedCafes = cafes
  .map((cafe, index) => {
    try {
      // 좌표값 trim 및 숫자 변환
      const x = parseFloat(String(cafe.X).trim());
      const y = parseFloat(String(cafe.Y).trim());

      if (isNaN(x) || isNaN(y)) {
        console.error(`[${index}] ${cafe.BPLCNM}: 유효하지 않은 좌표 (X: ${cafe.X}, Y: ${cafe.Y})`);
        errorCount++;
        return null;
      }

      // TM → WGS84 변환
      const [lng, lat] = proj4(TM_CENTRAL, WGS84, [x, y]);

      // 한국 영역 범위 검증 (대략적인 범위)
      if (lat < 33 || lat > 39 || lng < 124 || lng > 132) {
        console.error(
          `[${index}] ${cafe.BPLCNM}: 변환된 좌표가 한국 영역 밖 (lat: ${lat}, lng: ${lng})`
        );
        errorCount++;
        return null;
      }

      successCount++;

      return {
        name: cafe.BPLCNM,
        area: parseFloat(String(cafe.SITEAREA).trim()) || 0,
        type: cafe.UPTAENM,
        region: cafe.region,
        lat: Math.round(lat * 1000000) / 1000000, // 소수점 6자리
        lng: Math.round(lng * 1000000) / 1000000,
      };
    } catch (error) {
      console.error(`[${index}] ${cafe.BPLCNM}: 변환 오류 - ${error.message}`);
      errorCount++;
      return null;
    }
  })
  .filter(Boolean);

// 결과 저장
fs.writeFileSync(outputPath, JSON.stringify(convertedCafes, null, 2), "utf-8");

console.log(`\n변환 완료!`);
console.log(`- 성공: ${successCount}개`);
console.log(`- 실패: ${errorCount}개`);
console.log(`- 저장 위치: ${outputPath}`);
