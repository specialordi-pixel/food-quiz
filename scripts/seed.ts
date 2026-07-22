/**
 * 샘플 데이터 시드 스크립트
 * 오늘, 내일, 모레 3일치의 퍼즐 문제를 DB에 삽입
 * 사용: npm run seed
 */
import "dotenv/config";
import { Pool } from "pg";

const foods = [
  { answer: "떡볶이", accepted: ["떡볶이", "떡뽁이"] },
  { answer: "김밥", accepted: ["김밥"] },
  { answer: "비빔밥", accepted: ["비빔밥"] },
];

function getTodayKST(): string {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
}

function addDaysToDateStr(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL 환경변수가 설정되어 있지 않습니다");
    console.log(
      "local test를 위해서는 .env 파일에 DATABASE_URL을 설정하세요"
    );
    console.log(
      "예) DATABASE_URL=postgresql://user:password@localhost:5432/food_quiz"
    );
    process.exit(1);
  }

  const pool = new Pool({ connectionString: databaseUrl });

  try {
    const today = getTodayKST();

    for (let dayOffset = 0; dayOffset < 3; dayOffset++) {
      const playDate = addDaysToDateStr(today, dayOffset);
      console.log(`\n[seed] ${playDate}`);

      const { rows: existing } = await pool.query(
        "SELECT id FROM puzzle_sets WHERE play_date = $1",
        [playDate]
      );

      let puzzleSetId: string;
      if (existing.length > 0) {
        puzzleSetId = existing[0].id;
        console.log(`  [skip] 이미 존재함`);
        continue;
      } else {
        const { rows: newSet } = await pool.query(
          "INSERT INTO puzzle_sets (play_date) VALUES ($1) RETURNING id",
          [playDate]
        );
        puzzleSetId = newSet[0].id;
      }

      for (let i = 0; i < foods.length; i++) {
        const food = foods[i];
        const imageUrl = `/food-images/${i + 1}.png`;

        await pool.query(
          "INSERT INTO puzzle_items (puzzle_set_id, order_index, image_url, answer, accepted_answers) VALUES ($1, $2, $3, $4, $5)",
          [
            puzzleSetId,
            i + 1,
            imageUrl,
            food.answer,
            food.accepted,
          ]
        );
        console.log(`  [${i + 1}] ${food.answer}`);
      }
    }

    console.log("\n✓ 시드 완료!");
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
