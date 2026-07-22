# 배포 가이드

## 1. 로컬 개발 환경 설정

### 1.1 Postgres 설정 (로컬 또는 클라우드)

선택지:
- **로컬 PostgreSQL**: 로컬 머신에 PostgreSQL 설치 후 DB 생성
- **Neon (무료)**: https://neon.tech → 프로젝트 생성 → Connection String 복사
- **Vercel Postgres**: 나중에 배포할 때 자동 생성

### 1.2 .env 파일 생성

```bash
# .env.local (로컬 개발용, git ignore 됨)
DATABASE_URL=postgresql://user:password@localhost:5432/food_quiz
ADMIN_PASSWORD=your_secret_password
```

### 1.3 마이그레이션 실행

```bash
# Postgres 클라이언트가 설치되어 있다면
psql "$DATABASE_URL" -f supabase/migrations/0001_init.sql

# 또는 node 스크립트 사용 (추후 추가)
npm run migrate
```

### 1.4 샘플 데이터 시드

```bash
npm run sample-images  # 샘플 이미지 생성
npm run seed           # DB에 샘플 데이터 삽입
```

### 1.5 개발 서버 실행

```bash
npm run dev
# http://localhost:3000 에서 접근
```

## 2. Vercel 배포

### 2.1 Vercel 프로젝트 생성

1. https://vercel.com 접속 후 로그인
2. "Add New..." → "Project"
3. GitHub 저장소 연결 (또는 직접 업로드)

### 2.2 Vercel Postgres 생성

1. Vercel 대시보드에서 프로젝트 선택
2. "Storage" → "Create Database" → "Postgres"
3. 자동으로 `DATABASE_URL` 환경변수 추가됨

### 2.3 환경변수 설정

Vercel 프로젝트 Settings → Environment Variables

```
DATABASE_URL              (자동 추가됨)
ADMIN_PASSWORD=<your_secret>
```

### 2.4 마이그레이션 실행

Vercel Postgres 대시보드에서 직접 SQL 실행:
```sql
-- supabase/migrations/0001_init.sql 의 내용 복사 후 실행
```

또는 로컬에서:
```bash
npm run seed  # DATABASE_URL 환경변수 설정 필요
```

### 2.5 배포

Vercel은 자동 배포 (git push 시), 또는 수동:
```bash
npm i -g vercel
vercel deploy --prod
```

## 3. AI 이미지 생성 (LetsUR AI)

자동으로 AI 이미지를 생성해서 문제를 추가할 수 있습니다:

1. LetsUR API 키는 이미 `.env` 에 설정됨 (개발용 키 포함)
2. `.env` 확인:
   ```
   LETSUR_API_KEY=sk-bSosAGH1j_vJG1ldjA_KGQ
   ```
   - 가이드: https://platform.letsur.ai/guide
3. 스크립트 실행:
   ```bash
   npm run generate -- --days 7
   # 앞으로 7일치의 음식 사진 문제를 생성
   ```
   - 이미지는 `public/food-images/YYYY-MM-DD/` 에 저장됨
   - DB의 `puzzle_items` 테이블에 자동 삽입됨

## 4. 체크리스트

- [ ] 로컬 테스트 완료
  - [ ] 게임 플레이 (모든 3 문제 정답)
  - [ ] 닉네임 등록 및 순위표 확인
  - [ ] 관리자 로그인 및 기록 삭제
- [ ] Vercel 환경변수 설정
- [ ] Postgres 마이그레이션 실행
- [ ] 배포 후 실제 URL에서 재검증
