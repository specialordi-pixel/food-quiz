import { NextRequest, NextResponse } from "next/server";
import { verifyAdminPassword } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  if (!password) {
    return NextResponse.json(
      { error: "Missing password" },
      { status: 400 }
    );
  }

  if (!verifyAdminPassword(password)) {
    return NextResponse.json(
      { error: "Invalid password" },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ success: true });

  // httpOnly 쿠키로 관리자 토큰 저장 (클라이언트 JS에서 접근 불가)
  response.cookies.set("adminToken", "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60, // 24시간
  });

  return response;
}
