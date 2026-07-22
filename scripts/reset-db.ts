/**
 * 데이터베이스 초기화 스크립트 (개발용)
 * 모든 데이터를 삭제하고 테이블 구조만 유지
 */
import "dotenv/config";
import { Pool } from "pg";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL 환경변수가 설정되어 있지 않습니다");
  }

  const pool = new Pool({ connectionString: databaseUrl });

  try {
    console.log("🗑️ 데이터 초기화 중...");

    // 외래키 제약 때문에 순서 중요
    await pool.query("DELETE FROM scores");
    await pool.query("DELETE FROM puzzle_items");
    await pool.query("DELETE FROM puzzle_sets");

    console.log("✅ 초기화 완료!");
  } catch (err) {
    console.error("❌ 오류:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
