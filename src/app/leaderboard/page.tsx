"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Score {
  nickname: string;
  total_time_ms: number;
  created_at: string;
}

export default function LeaderboardPage() {
  const [scores, setScores] = useState<Score[]>([]);
  const [puzzleSetId, setPuzzleSetId] = useState<string>("");
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      // 먼저 오늘 퍼즐 세트 조회
      const puzzleRes = await fetch("/api/puzzle/today");
      if (!puzzleRes.ok) {
        setError("오늘 문제를 불러올 수 없습니다");
        return;
      }
      const puzzle = await puzzleRes.json();
      setPuzzleSetId(puzzle.puzzleSetId);

      // 점수 조회
      const scoresRes = await fetch(`/api/scores?puzzleSetId=${puzzle.puzzleSetId}`);
      if (!scoresRes.ok) {
        setError("순위표를 불러올 수 없습니다");
        return;
      }
      const data = await scoresRes.json();
      setScores(data.scores);
    })();
  }, []);

  const formatTime = (ms: number) => {
    const secs = Math.floor(ms / 1000);
    const mins = Math.floor(secs / 60);
    const secsRem = secs % 60;
    return `${mins}:${String(secsRem).padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">오늘의 순위</h1>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {scores.length === 0 && !error && (
          <p className="text-center text-gray-400 mb-4">아직 기록이 없습니다</p>
        )}

        {scores.length > 0 && (
          <div className="space-y-2">
            {scores.map((score, idx) => (
              <div key={idx} className="bg-gray-800 p-4 rounded flex justify-between items-center">
                <div>
                  <span className="text-xl font-bold text-yellow-400">{idx + 1}위</span>
                  <span className="ml-4 text-lg">{score.nickname}</span>
                </div>
                <div className="text-2xl font-bold text-green-400">{formatTime(score.total_time_ms)}</div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-4 mt-8">
          <Link
            href="/play"
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded font-bold text-center hover:bg-blue-700"
          >
            다시 풀기
          </Link>
          <Link
            href="/"
            className="flex-1 px-4 py-2 bg-gray-700 text-white rounded font-bold text-center hover:bg-gray-600"
          >
            홈
          </Link>
          <Link
            href="/admin"
            className="flex-1 px-4 py-2 bg-red-700 text-white rounded font-bold text-center hover:bg-red-600"
          >
            관리
          </Link>
        </div>
      </div>
    </div>
  );
}
