"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Score {
  nickname: string;
  total_time_ms: number;
}

export default function Home() {
  const [topScores, setTopScores] = useState<Score[]>([]);
  const [hasPlayed, setHasPlayed] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/puzzle/today");
        if (res.ok) {
          const puzzle = await res.json();
          const scoresRes = await fetch(`/api/scores?puzzleSetId=${puzzle.puzzleSetId}`);
          if (scoresRes.ok) {
            const data = await scoresRes.json();
            setTopScores(data.scores.slice(0, 5));
          }
        }
      } catch (e) {
        // 무시
      }

      const today = new Date().toISOString().slice(0, 10);
      setHasPlayed(localStorage.getItem(`played_${today}`) === "true");
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
        <h1 className="text-5xl font-bold mb-4 text-center">🍜 오늘의 음식 퀴즈</h1>
        <p className="text-center text-gray-400 mb-8">확대된 음식 사진을 맞혀보세요!</p>

        {hasPlayed ? (
          <div className="bg-yellow-900 border border-yellow-700 p-4 rounded mb-8 text-center">
            <p className="text-yellow-200">오늘 이미 플레이했습니다</p>
          </div>
        ) : (
          <div className="text-center mb-8">
            <Link
              href="/play"
              className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700"
            >
              게임 시작
            </Link>
          </div>
        )}

        {topScores.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">🏆 오늘 상위 점수</h2>
            <div className="space-y-2">
              {topScores.map((score, idx) => (
                <div key={idx} className="bg-gray-800 p-3 rounded flex justify-between">
                  <span className="text-lg">
                    <span className="font-bold text-yellow-400">{idx + 1}.</span> {score.nickname}
                  </span>
                  <span className="text-green-400 font-bold">{formatTime(score.total_time_ms)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-4 mt-8">
          <Link
            href="/leaderboard"
            className="flex-1 px-4 py-2 bg-gray-700 text-white rounded font-bold text-center hover:bg-gray-600"
          >
            전체 순위
          </Link>
          <Link
            href="/admin"
            className="flex-1 px-4 py-2 bg-red-700 text-white rounded font-bold text-center hover:bg-red-600"
          >
            관리자
          </Link>
        </div>
      </div>
    </div>
  );
}
