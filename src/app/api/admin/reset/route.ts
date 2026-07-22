import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function isAdmin(req: NextRequest): boolean {
  const cookie = req.cookies.get("adminToken");
  return cookie?.value === "true";
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { playDate } = await req.json();

  if (!playDate) {
    return NextResponse.json(
      { error: "Missing playDate" },
      { status: 400 }
    );
  }

  // 해당 날짜의 점수 삭제
  await db.query(
    `delete from scores where puzzle_set_id = (
       select id from puzzle_sets where play_date = $1
     )`,
    [playDate]
  );

  return NextResponse.json({ success: true });
}
