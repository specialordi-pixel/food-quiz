/**
 * 데이터베이스 마이그레이션 스크립트
 * supabase/migrations/0001_init.sql 을 실행
 */
import "dotenv/config";
import { Pool } from "pg";
import fs from "fs";
import path from "path";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL 환경변수가 설정되어 있지 않습니다");
  }

  const pool = new Pool({ connectionString: databaseUrl });

  try {
    // 마이그레이션 파일 읽기
    const migrationPath = path.join(process.cwd(), "supabase", "migrations", "0001_init.sql");
    const sql = fs.readFileSync(migrationPath, "utf-8");

    console.log("📝 마이그레이션 실행 중...");
    await pool.query(sql);
    console.log("✅ 마이그레이션 완료!");
  } catch (err) {
    console.error("❌ 마이그레이션 오류:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
