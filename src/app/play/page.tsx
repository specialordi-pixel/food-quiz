"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface PuzzleItem {
  id: string;
  order_index: number;
  image_url: string;
}

interface PuzzleSet {
  puzzleSetId: string;
  playDate: string;
  items: PuzzleItem[];
}

export default function PlayPage() {
  const [puzzle, setPuzzle] = useState<PuzzleSet | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [startTime] = useState(Date.now());
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [nickname, setNickname] = useState("");
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [error, setError] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scaleRef = useRef(4);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/puzzle/today");
      if (!res.ok) {
        setError("오늘 문제를 불러올 수 없습니다");
        return;
      }
      const data = await res.json();
      setPuzzle(data);
    })();
  }, []);

  // 타이머
  useEffect(() => {
    if (isGameComplete) return;
    timerRef.current = setInterval(() => {
      setElapsedMs(Date.now() - startTime);
    }, 100);
    return () => clearInterval(timerRef.current!);
  }, [startTime, isGameComplete]);

  // 이미지 확대/축소 애니메이션
  useEffect(() => {
    const imageEl = document.getElementById("puzzle-image") as HTMLImageElement;
    if (!imageEl || isGameComplete) return;

    const maxScaleTime = 30000; // 30초에 걸쳐 축소
    const elapsed = elapsedMs % maxScaleTime;
    const scale = Math.max(1, 4 - (elapsed / maxScaleTime) * 3);
    scaleRef.current = scale;

    const centerX = imageEl.width / 2;
    const centerY = imageEl.height / 2;
    imageEl.style.transform = `scale(${scale})`;
    imageEl.style.transformOrigin = `${centerX}px ${centerY}px`;
  }, [elapsedMs, isGameComplete]);

  if (!puzzle) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        {error ? <p className="text-red-500">{error}</p> : <p>로딩 중...</p>}
      </div>
    );
  }

  const current = puzzle.items[currentIndex];

  const handleCheckAnswer = async () => {
    if (!userAnswer.trim()) return;
    setIsChecking(true);

    const res = await fetch("/api/answer/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ puzzleItemId: current.id, userAnswer }),
    });

    const data = await res.json();
    if (data.isCorrect) {
      if (currentIndex < puzzle.items.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setUserAnswer("");
      } else {
        // 마지막 문제 정답
        setIsGameComplete(true);
      }
    }

    setIsChecking(false);
  };

  const handleSubmitScore = async () => {
    if (!nickname.trim()) return;
    setIsSubmittingScore(true);

    const res = await fetch("/api/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        puzzleSetId: puzzle.puzzleSetId,
        nickname: nickname.trim(),
        totalTimeMs: Math.round(elapsedMs),
      }),
    });

    if (res.ok) {
      // 로컬스토리지에 플레이 기록 저장
      localStorage.setItem(`played_${puzzle.playDate}`, "true");
      // 랭킹 페이지로 이동
      window.location.href = "/leaderboard";
    } else {
      alert("점수 저장에 실패했습니다");
    }
    setIsSubmittingScore(false);
  };

  const formatTime = (ms: number) => {
    const secs = Math.floor(ms / 1000);
    const mins = Math.floor(secs / 60);
    const secsRem = secs % 60;
    return `${mins}:${String(secsRem).padStart(2, "0")}`;
  };

  if (isGameComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="max-w-md w-full bg-gray-800 p-8 rounded-lg">
          <h1 className="text-3xl font-bold mb-6 text-center">완료!</h1>
          <p className="text-center mb-6 text-xl">
            소요 시간: <span className="text-green-400">{formatTime(elapsedMs)}</span>
          </p>

          <input
            type="text"
            placeholder="닉네임 (1-20자)"
            value={nickname}
            onChange={(e) => setNickname(e.target.value.slice(0, 20))}
            className="w-full px-4 py-2 mb-4 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400"
            disabled={isSubmittingScore}
          />

          <button
            onClick={handleSubmitScore}
            disabled={isSubmittingScore || !nickname.trim()}
            className="w-full px-4 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700 disabled:opacity-50"
          >
            {isSubmittingScore ? "저장 중..." : "순위표에 등록"}
          </button>

          <Link href="/" className="block text-center mt-4 text-blue-400 hover:underline">
            홈으로
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-2xl w-full">
        <div className="mb-6 flex justify-between items-center">
          <div className="text-2xl font-bold">
            문제 {currentIndex + 1} / {puzzle.items.length}
          </div>
          <div className="text-3xl font-bold text-green-400">{formatTime(elapsedMs)}</div>
        </div>

        <div className="bg-gray-800 p-8 rounded-lg mb-6 overflow-hidden">
          <div className="relative w-full h-96 bg-black rounded flex items-center justify-center overflow-hidden">
            <img
              id="puzzle-image"
              src={current.image_url}
              alt="음식"
              className="w-full h-full object-cover"
              style={{
                transformOrigin: "center",
                transition: "none",
              }}
            />
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <input
            type="text"
            placeholder="정답 입력..."
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !isChecking && handleCheckAnswer()}
            className="w-full px-4 py-2 mb-4 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400"
            autoFocus
          />

          <button
            onClick={handleCheckAnswer}
            disabled={isChecking || !userAnswer.trim()}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 disabled:opacity-50"
          >
            {isChecking ? "확인 중..." : "확인"}
          </button>
        </div>

        <Link href="/" className="block text-center mt-6 text-blue-400 hover:underline">
          포기하기
        </Link>
      </div>
    </div>
  );
}
