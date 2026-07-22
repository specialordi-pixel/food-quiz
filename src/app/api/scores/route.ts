import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const puzzleSetId = req.nextUrl.searchParams.get("puzzleSetId");

  if (!puzzleSetId) {
    return NextResponse.json(
      { error: "Missing puzzleSetId" },
      { status: 400 }
    );
  }

  const result = await db.query(
    `select nickname, total_time_ms, created_at
     from scores
     where puzzle_set_id = $1
     order by total_time_ms asc`,
    [puzzleSetId]
  );

  return NextResponse.json({
    scores: result.rows,
  });
}

export async function POST(req: NextRequest) {
  const { puzzleSetId, nickname, totalTimeMs } = await req.json();

  if (!puzzleSetId || !nickname || totalTimeMs === undefined) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  if (typeof nickname !== "string" || nickname.length < 1 || nickname.length > 20) {
    return NextResponse.json(
      { error: "Nickname must be 1-20 characters" },
      { status: 400 }
    );
  }

  if (typeof totalTimeMs !== "number" || totalTimeMs <= 0) {
    return NextResponse.json(
      { error: "totalTimeMs must be positive" },
      { status: 400 }
    );
  }

  // 최소 시간 검증 (3문제 최소 3초 이상, 비현실적인 기록 거부)
  if (totalTimeMs < 3000) {
    return NextResponse.json(
      { error: "Time too short to be realistic" },
      { status: 400 }
    );
  }

  await db.query(
    `insert into scores (puzzle_set_id, nickname, total_time_ms)
     values ($1, $2, $3)`,
    [puzzleSetId, nickname, totalTimeMs]
  );

  return NextResponse.json({ success: true }, { status: 201 });
}
