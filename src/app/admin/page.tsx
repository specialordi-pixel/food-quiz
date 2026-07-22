"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [playDate, setPlayDate] = useState(new Date().toISOString().slice(0, 10));
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    // 페이지 로드 시 쿠키 확인 (클라이언트에서는 httpOnly 쿠키를 볼 수 없지만, 서버 API 호출 시 자동 포함됨)
    // 간단한 방식: API 호출해서 권한 확인
    fetch("/api/admin/check", { method: "GET" })
      .then((res) => setIsLoggedIn(res.ok))
      .catch(() => setIsLoggedIn(false))
      .finally(() => setIsLoading(false));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      setIsLoggedIn(true);
      setPassword("");
    } else {
      setError("비밀번호가 올바르지 않습니다");
    }
    setIsLoading(false);
  };

  const handleReset = async () => {
    if (!confirm(`${playDate} 점수를 모두 삭제하시겠습니까?`)) return;
    setIsResetting(true);

    const res = await fetch("/api/admin/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playDate }),
    });

    if (res.ok) {
      alert("점수가 삭제되었습니다");
    } else {
      alert("삭제에 실패했습니다");
    }
    setIsResetting(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <p>로딩 중...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white p-4">
        <div className="max-w-md w-full bg-gray-800 p-8 rounded-lg">
          <h1 className="text-3xl font-bold mb-6 text-center">관리자 로그인</h1>

          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 mb-4 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400"
            />

            <button
              type="submit"
              className="w-full px-4 py-2 bg-red-600 text-white rounded font-bold hover:bg-red-700"
            >
              로그인
            </button>
          </form>

          <Link href="/" className="block text-center mt-4 text-blue-400 hover:underline">
            홈으로
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">관리자 대시보드</h1>

        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-bold mb-4">점수 초기화</h2>

          <div className="mb-4">
            <label className="block text-sm font-bold mb-2">날짜</label>
            <input
              type="date"
              value={playDate}
              onChange={(e) => setPlayDate(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
            />
          </div>

          <button
            onClick={handleReset}
            disabled={isResetting}
            className="w-full px-4 py-2 bg-red-600 text-white rounded font-bold hover:bg-red-700 disabled:opacity-50"
          >
            {isResetting ? "처리 중..." : "점수 삭제"}
          </button>
        </div>

        <Link href="/" className="block text-center text-blue-400 hover:underline">
          홈으로
        </Link>
      </div>
    </div>
  );
}
