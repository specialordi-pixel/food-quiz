import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { todayKST } from "@/lib/date";

export async function GET() {
  const today = todayKST();

  const result = await db.query(
    `select ps.id as puzzle_set_id, ps.play_date, pi.id, pi.order_index, pi.image_url
     from puzzle_sets ps
     left join puzzle_items pi on ps.id = pi.puzzle_set_id
     where ps.play_date = $1
     order by pi.order_index`,
    [today]
  );

  if (result.rows.length === 0) {
    return NextResponse.json(
      { error: "No puzzle set for today" },
      { status: 404 }
    );
  }

  const puzzleSetId = result.rows[0].puzzle_set_id;
  const items = result.rows
    .filter((r) => r.id)
    .map((r) => ({
      id: r.id,
      order_index: r.order_index,
      image_url: r.image_url,
    }));

  return NextResponse.json({
    puzzleSetId,
    playDate: today,
    items,
  });
}
