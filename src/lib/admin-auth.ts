import "server-only";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_PASSWORD) {
  throw new Error("ADMIN_PASSWORD 환경변수가 설정되어 있지 않습니다");
}

export function verifyAdminPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

export function getAdminToken(): string {
  // 간단한 토큰: 타임스탬프 기반 (실제로는 더 안전한 방식 사용)
  // 프로덕션에서는 JWT 사용 권장
  return "admin_" + Date.now();
}
