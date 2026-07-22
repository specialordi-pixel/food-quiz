import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkAnswer } from "@/lib/answer-check";

export async function POST(req: NextRequest) {
  const { puzzleItemId, userAnswer } = await req.json();

  if (!puzzleItemId || !userAnswer) {
    return NextResponse.json(
      { error: "Missing puzzleItemId or userAnswer" },
      { status: 400 }
    );
  }

  const result = await db.query(
    "select answer, accepted_answers from puzzle_items where id = $1",
    [puzzleItemId]
  );

  if (result.rows.length === 0) {
    return NextResponse.json({ error: "Puzzle item not found" }, { status: 404 });
  }

  const { answer, accepted_answers } = result.rows[0];
  const allAnswers = [answer, ...(accepted_answers || [])];
  const isCorrect = checkAnswer(userAnswer, allAnswers);

  return NextResponse.json({ isCorrect });
}
