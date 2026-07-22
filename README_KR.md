# 🍜 오늘의 음식 실루엣 퀴즈

매일 새로운 음식 사진을 확대→축소하며 보여주고, 플레이어들이 정답을 맞혀 순위를 경쟁하는 게임입니다.

## ✨ 주요 기능

- **게임 플레이** — 확대된 음식 사진이 점점 공개되는 동안 정답 입력
- **개인 기록** — 닉네임 입력 후 시간순 순위표에 기록
- **관리자 기능** — 비밀번호로 로그인 후 기록 초기화/삭제 가능
- **AI 이미지 생성** — LetsUR AI로 자동 문제 생성 (선택사항)

## 🚀 빠른 시작

### 1단계: 로컬 개발 환경

```bash
# 저장소 클론 후 폴더 이동
cd "0722 game"

# 의존성 설치
npm install

# 샘플 이미지 생성 (테스트용)
npm run sample-images
```

### 2단계: 데이터베이스 설정

**선택지:**
- **Neon (무료)**: https://neon.tech → 프로젝트 생성 → CONNECTION_STRING 복사
- **로컬 PostgreSQL**: `postgresql://localhost:5432/food_quiz`

```bash
# .env 파일에 데이터베이스 URL 추가
# DATABASE_URL=postgresql://...
```

### 3단계: 마이그레이션 & 시드

```bash
# 테이블 생성
psql "$DATABASE_URL" -f supabase/migrations/0001_init.sql

# 샘플 데이터 삽입 (3일치)
npm run seed
```

### 4단계: 개발 서버 실행

```bash
npm run dev
# http://localhost:3000 에서 접근
```

## 🎮 게임 방법

1. **홈** — "게임 시작" 클릭
2. **플레이** — 음식 사진을 보고 정답 입력 (3문제)
3. **기록** — 닉네임 입력 후 순위표에 기록
4. **순위표** — 오늘 점수 확인

## 🛠️ 관리자 페이지

- URL: `/admin`
- 비밀번호: `.env` 의 `ADMIN_PASSWORD` (기본값: `test123`)
- 기능: 특정 날짜의 모든 기록 삭제

## 🤖 AI 이미지 생성

LetsUR AI로 자동 문제 생성:

```bash
npm run generate -- --days 7
```

- 앞으로 7일치 음식 사진 3개씩 생성
- 이미지: `public/food-images/YYYY-MM-DD/` 저장
- DB: 자동 삽입

**API 키**: `.env` 의 `LETSUR_API_KEY`

## 📦 배포 (Vercel)

### 1. Vercel 프로젝트 생성
```bash
npm i -g vercel
vercel
```

### 2. 환경변수 설정 (Vercel 대시보드)
```
DATABASE_URL    (Vercel Postgres 자동 생성)
ADMIN_PASSWORD  (예: your_secret_123)
LETSUR_API_KEY  (이미 .env 에 포함됨)
```

### 3. 마이그레이션 실행
Vercel Postgres 콘솔에서 `supabase/migrations/0001_init.sql` 실행

### 4. 배포
```bash
git push origin main  # 자동 배포
# 또는
vercel --prod
```

## 📁 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx           # 홈 페이지
│   ├── play/page.tsx      # 게임 플레이
│   ├── leaderboard/       # 순위표
│   ├── admin/             # 관리자 페이지
│   └── api/               # API 라우트
├── lib/
│   ├── db.ts              # Postgres 클라이언트
│   ├── types.ts           # 타입 정의
│   ├── date.ts            # 날짜 유틸
│   └── answer-check.ts    # 정답 검증
public/
└── food-images/           # 게임 이미지
```

## 🔧 환경변수

```
DATABASE_URL          # Postgres 연결 문자열 (필수)
ADMIN_PASSWORD        # 관리자 비밀번호 (기본: test123)
LETSUR_API_KEY        # LetsUR AI API 키 (이미지 생성용)
```

## 💡 팁

- **시간 제한 없음**: 확대→축소는 30초 사이클, 정답 입력은 자유
- **중복 플레이**: 같은 날 여러 번 참여 가능 (기록은 누적)
- **오타 허용**: 대소문자/공백 무시
- **localhost 테스트**: `.env.local` 에 로컬 DB URL 설정하면 배포와 독립적으로 테스트 가능

## 📋 체크리스트

- [ ] 로컬 테스트
  - [ ] 게임 플레이 (3문제 완료)
  - [ ] 순위표 확인
  - [ ] 관리자 기록 삭제
- [ ] Vercel 배포
  - [ ] 환경변수 설정
  - [ ] 마이그레이션 실행
  - [ ] 배포 후 재검증
- [ ] 이미지 생성 (선택)
  - [ ] `npm run generate -- --days 30` 실행

## 📞 문의

가이드: https://platform.letsur.ai/guide

---

**Made with Next.js 16 + Vercel Postgres + LetsUR AI** 🚀
