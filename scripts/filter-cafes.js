import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. 확실히 제외할 패턴들 (비카페)
const EXCLUDE_NON_CAFE_PATTERNS = [
  // 패스트푸드
  /맥도날드/,
  /버거킹/,
  /롯데리아/,
  /파파이스/,
  /맘스터치/,
  /케이에프씨/,
  /KFC/i,
  /써브웨이/,
  /파파존스/,
  /피자헛/,
  /도미노피자/,
  /노브랜드버거/,

  // 코스트코 계열
  /코스트코/,
  /트레이더스/,

  // 구내식당/카페
  /구내식당/,
  /학생식당/,
  /카페테리아/,
  /웰스토리/,
  /푸드코트/,
  /푸드라운지/,
  /라운지디국립/,

  // 만화/보드게임 카페
  /만화카페/,
  /카페툰/,
  /해피치만화/,
  /보드게임카페/,
  /보드게임 카페/,
  /벌툰/,
  /아키바코믹스/,
  /놀숲/,

  // 키즈카페
  /키즈카페/,
  /키즈까페/,
  /키즈쿡/,
  /키즈라운지/,
  /타요더카페/,
  /아이노리/,
  /로라바운스/,
  /베베앙쥬/,
  /키즈 스터디/,

  // 동물카페
  /개떼월드/,
  /캣츠 아이 스튜디오/,

  // 골프장
  /스크린골프/,
  /골프존/,

  // 음식점 (분명한 것들)
  /국수나무/,
  /삼동소바/,
  /주문진동치미막국수/,
  /만두전골과칼국수/,
  /왕세숫대야냉면/,
  /온정손만두/,
  /본우리 반상/,
  /아웃백스테이크/,
  /콘타이 /,
  /미가온$/,
  /공룡식당/,
  /서로좋은식당/,

  // 로비라운지
  /로비라운지/,

  // 기타 비카페
  /웨딩하우스/,
  /가톨릭회관/,
  /성신문화사/,
  /보훈병원상조회/,
  /세라젬/,
  /스키장렌탈/,
  /홈플러스(?!.*카페)/,
  /\(주\)한국축지/,
  /휴게소(?!.*카페)/,
  /뷔페/,
  /푸드트럭/,
  /PC카페/,
  /PC방/,
  /피시방/,
  /네옥스피시/,
  /레벨업PC/,
  /비엠더블유 차징/,
  /\(주\)공항앤드테라스/,

  // 휴게소/식당가
  /휴게소\s*\[/,
  /휴게소.*식당/,
  /식당가$/,
];

// 2. 브랜드 카페 (제외)
const EXCLUDE_BRAND_PATTERNS = [
  // 대형 커피 프랜차이즈
  /스타벅스/,
  /커피빈/,
  /투썸플레이스/,
  /투섬플레이스/,
  /할리스/,
  /이디야/,
  /파스쿠찌/,
  /엔제리너스/,
  /탐앤탐스/,
  /카페베네/,
  /폴바셋/,
  /공차/,
  /컴포즈/,
  /메가엠지씨/,
  /메가커피/,
  /MEGA MGC/i,
  /빽다방/,
  /더벤티/,
  /달콤커피/,
  /드롭탑/,
  /까페드롭탑/,
  /커피니/,
  /커피베이/,
  /빈스빈스/,
  /아티제/,
  /요거프레소/,
  /블루보틀/,

  // 디저트/아이스크림 프랜차이즈
  /설빙/,
  /배스킨라빈스/,
  /베스킨라빈스/,
  /던킨도너츠/,
  /던킨도우넛/,
  /크리스피크림/,
  /하겐다즈/,
  /디저트39/,

  // 베이커리 프랜차이즈
  /파리바게뜨/,
  /뚜레쥬르/,
  /파리크라상/,

  // 기타 브랜드
  /오설록/,
  /이니스프리/,
  /테라로사/,
  /블루버드/,
  /쁘띠몽드/,
];

// 모든 제외 패턴 합치기
const ALL_EXCLUDE_PATTERNS = [
  ...EXCLUDE_NON_CAFE_PATTERNS,
  ...EXCLUDE_BRAND_PATTERNS,
];

// 파일 읽기
const seoulData = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "..", "대형카페_list.json"),
    "utf-8"
  )
);
const gyeonggiData = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "..", "경기_대형카페_list.json"),
    "utf-8"
  )
);

console.log(`서울 원본: ${seoulData.length}개`);
console.log(`경기 원본: ${gyeonggiData.length}개`);

function filterCafes(data) {
  const excluded = [];
  const toReview = []; // 검토필요 (검색 대상)

  for (const item of data) {
    const name = item.BPLCNM;

    // 제외 패턴 체크
    const shouldExclude = ALL_EXCLUDE_PATTERNS.some((pattern) =>
      pattern.test(name)
    );

    if (shouldExclude) {
      excluded.push(item);
    } else {
      // 나머지는 모두 검토필요 (인터넷 검색 대상)
      toReview.push(item);
    }
  }

  return { excluded, toReview };
}

// 필터링 실행
const seoulResult = filterCafes(seoulData);
const gyeonggiResult = filterCafes(gyeonggiData);

console.log("\n=== 서울 ===");
console.log(`제외: ${seoulResult.excluded.length}개`);
console.log(`검토필요(검색대상): ${seoulResult.toReview.length}개`);

console.log("\n=== 경기 ===");
console.log(`제외: ${gyeonggiResult.excluded.length}개`);
console.log(`검토필요(검색대상): ${gyeonggiResult.toReview.length}개`);

// 결과 저장
const outputDir = path.join(__dirname, "..", "filtered");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// 서울
fs.writeFileSync(
  path.join(outputDir, "서울_제외.json"),
  JSON.stringify(seoulResult.excluded, null, 2),
  "utf-8"
);
fs.writeFileSync(
  path.join(outputDir, "서울_검토필요.json"),
  JSON.stringify(seoulResult.toReview, null, 2),
  "utf-8"
);

// 경기
fs.writeFileSync(
  path.join(outputDir, "경기_제외.json"),
  JSON.stringify(gyeonggiResult.excluded, null, 2),
  "utf-8"
);
fs.writeFileSync(
  path.join(outputDir, "경기_검토필요.json"),
  JSON.stringify(gyeonggiResult.toReview, null, 2),
  "utf-8"
);

// 검토 필요한 이름만 추출 (인터넷 검색용) - 중복 제거
const toReviewNames = [
  ...new Set([
    ...seoulResult.toReview.map((x) => x.BPLCNM),
    ...gyeonggiResult.toReview.map((x) => x.BPLCNM),
  ]),
].sort();

fs.writeFileSync(
  path.join(outputDir, "검토필요_이름목록.txt"),
  toReviewNames.join("\n"),
  "utf-8"
);

console.log("\n=== 결과 파일 저장 완료 ===");
console.log(`저장 위치: ${outputDir}`);
console.log(`- 서울_제외.json (${seoulResult.excluded.length}개)`);
console.log(`- 서울_검토필요.json (${seoulResult.toReview.length}개)`);
console.log(`- 경기_제외.json (${gyeonggiResult.excluded.length}개)`);
console.log(`- 경기_검토필요.json (${gyeonggiResult.toReview.length}개)`);
console.log(`- 검토필요_이름목록.txt (${toReviewNames.length}개 - 중복제거)`);

// 제외된 브랜드 카페 수 출력
const brandExcludedSeoul = seoulResult.excluded.filter((x) =>
  EXCLUDE_BRAND_PATTERNS.some((p) => p.test(x.BPLCNM))
);
const brandExcludedGyeonggi = gyeonggiResult.excluded.filter((x) =>
  EXCLUDE_BRAND_PATTERNS.some((p) => p.test(x.BPLCNM))
);

console.log(`\n=== 브랜드 카페 제외 현황 ===`);
console.log(`서울 브랜드 카페 제외: ${brandExcludedSeoul.length}개`);
console.log(`경기 브랜드 카페 제외: ${brandExcludedGyeonggi.length}개`);
