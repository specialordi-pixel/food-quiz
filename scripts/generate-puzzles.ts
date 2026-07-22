/**
 * 앞으로의 날짜에 대해 음식 사진 퀴즈 3문제씩을 미리 생성한다.
 * - LetsUR AI API로 음식 사진 생성
 * - public/food-images/ 에 저장
 * - puzzle_sets / puzzle_items 테이블에 삽입 (이미 존재하는 날짜는 건너뜀)
 *
 * 사용법: npm run generate -- --days 14 [--start 2026-08-01]
 */
import "dotenv/config";
import { Pool } from "pg";
import fs from "fs";
import path from "path";

const FOODS: { answer: string; accepted: string[]; prompt: string }[] = [
  { answer: "떡볶이", accepted: ["떡볶이", "떡뽁이"], prompt: "Korean tteokbokki, spicy red rice cakes in a shallow pan, close-up food photography, professional food photo" },
  { answer: "김밥", accepted: ["김밥"], prompt: "Korean gimbap rolls sliced on a wooden board, close-up food photography, professional food photo" },
  { answer: "비빔밥", accepted: ["비빔밥"], prompt: "Korean bibimbap in a stone bowl with colorful vegetables and egg yolk on top, close-up food photography" },
  { answer: "삼겹살", accepted: ["삼겹살", "삼겹살구이"], prompt: "Korean grilled pork belly samgyeopsal on a grill, close-up food photography" },
  { answer: "라면", accepted: ["라면", "라멘"], prompt: "Korean instant ramyeon noodles in a red spicy broth in a pot, close-up food photography" },
  { answer: "김치찌개", accepted: ["김치찌개", "김치 찌개"], prompt: "Korean kimchi jjigae stew bubbling in a black pot, close-up food photography" },
  { answer: "치킨", accepted: ["치킨", "후라이드치킨"], prompt: "Korean fried chicken pieces on a plate, close-up food photography" },
  { answer: "피자", accepted: ["피자"], prompt: "Cheesy pepperoni pizza slice, close-up food photography" },
  { answer: "초밥", accepted: ["초밥", "스시"], prompt: "Assortment of sushi nigiri on a black plate, close-up food photography" },
  { answer: "냉면", accepted: ["냉면", "물냉면"], prompt: "Korean cold noodles naengmyeon in an icy broth with egg, close-up food photography" },
];

function parseArgs() {
  const args = process.argv.slice(2);
  let days = 7;
  let start: string | undefined;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--days") days = parseInt(args[++i], 10);
    if (args[i] === "--start") start = args[++i];
  }
  return { days, start };
}

function todayKST(): string {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
}

function addDaysToDateStr(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function pickThreeFoods(seed: number) {
  const n = FOODS.length;
  const indices = [seed % n, (seed + 7) % n, (seed + 13) % n];
  const unique = Array.from(new Set(indices));
  let filler = 0;
  while (unique.length < 3) {
    if (!unique.includes(filler)) unique.push(filler);
    filler++;
  }
  return unique.slice(0, 3).map((i) => FOODS[i]);
}

async function generateImageWithLetsUR(prompt: string): Promise<Buffer> {
  const apiKey = process.env.LETSUR_API_KEY;
  if (!apiKey) {
    throw new Error("LETSUR_API_KEY 환경변수가 설정되어 있지 않습니다");
  }

  const response = await fetch("https://gw.letsur.ai/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      model: "gpt-image-2",
      prompt,
      size: "1024x1024",
      response_format: "b64_json",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`LetsUR API 오류: ${response.status} ${error}`);
  }

  const data = await response.json();
  const b64 = data.data?.[0]?.b64_json;
  if (!b64) {
    throw new Error("이미지 생성 실패: b64_json 없음");
  }

  return Buffer.from(b64, "base64");
}

async function main() {
  const { days, start } = parseArgs();
  const startDate = start ?? todayKST();

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL 환경변수가 설정되어 있지 않습니다");
  }

  const pool = new Pool({ connectionString: databaseUrl });

  try {
    for (let dayOffset = 0; dayOffset < days; dayOffset++) {
      const playDate = addDaysToDateStr(startDate, dayOffset);
      console.log(`\n[process] ${playDate}`);

      const { rows: existing } = await pool.query(
        "SELECT id FROM puzzle_sets WHERE play_date = $1",
        [playDate]
      );

      if (existing.length > 0) {
        console.log(`  [skip] 이미 존재함`);
        continue;
      }

      const { rows: newSet } = await pool.query(
        "INSERT INTO puzzle_sets (play_date) VALUES ($1) RETURNING id",
        [playDate]
      );
      const puzzleSetId = newSet[0].id;

      const seed = parseInt(playDate.replace(/-/g, ""), 10);
      const foods = pickThreeFoods(seed);

      // 이미지 저장 폴더 생성
      const foodImagesDir = path.join(process.cwd(), "public", "food-images", playDate);
      fs.mkdirSync(foodImagesDir, { recursive: true });

      for (let i = 0; i < foods.length; i++) {
        const orderIndex = i + 1;
        const food = foods[i];
        console.log(`  [gen] #${orderIndex} ${food.answer}`);

        const imageBuffer = await generateImageWithLetsUR(food.prompt);
        const filename = `${orderIndex}.png`;
        const filePath = path.join(foodImagesDir, filename);
        fs.writeFileSync(filePath, imageBuffer);
        console.log(`    → 저장: ${filePath}`);

        // DB에 삽입
        const imageUrl = `/food-images/${playDate}/${filename}`;
        await pool.query(
          `INSERT INTO puzzle_items (puzzle_set_id, order_index, image_url, answer, accepted_answers)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            puzzleSetId,
            orderIndex,
            imageUrl,
            food.answer,
            food.accepted,
          ]
        );
      }

      console.log(`  [done] ${playDate} 완료`);
    }
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("❌ 오류:", err);
  process.exit(1);
});
