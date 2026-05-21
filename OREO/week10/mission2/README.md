# Week 10 — Mission 2: Vercel 배포 + react-router

UMC 10th DAU Web · 10주차 미션 2 — **미션1 영화 사이트를 Vercel로 배포 + `react-router-dom`으로 영화 상세 라우팅 + SPA 새로고침 404 방지**

미션1 베이스에 라우팅·`vercel.json`을 추가했습니다.

---

## 1. 추가된 것들

### `react-router-dom`
```
src/
  pages/
    SearchPage.tsx        ← 미션1 App.tsx 내용을 페이지로 추출
    MoviePage.tsx         ← /movies/:movieId 상세 페이지
  App.tsx                 ← BrowserRouter + Routes
```

라우트:
- `/` → `SearchPage` (검색 + 카드 그리드)
- `/movies/:movieId` → `MoviePage` (영화 상세)

검색 결과 카드 클릭 시 `navigate('/movies/' + id)` 로 이동. 별도로 URL에 직접 입력해도 진입 가능.

### `vercel.json`
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

SPA에서 새로고침 시 404가 뜨는 이유 → Vercel은 `/movies/123` 경로의 정적 파일을 찾으려 하다 못 찾고 404. rewrites로 **모든 경로를 `index.html`로 보내면** 클라이언트 사이드 라우터(`BrowserRouter`)가 URL을 받아 알맞은 컴포넌트를 렌더.

### `.gitignore`에 `.env`
미션1에서 이미 추가됨. TMDB token이 git에 안 올라가도록.

---

## 2. Vercel 배포 가이드 (사용자가 직접 실행)

### Step 1. GitHub 푸시
이미 `oreore051/UMC_DAU_10th_Web` 의 `week10_미션2` 브랜치에 push됨.

### Step 2. Vercel CLI 설치 + 로그인
```bash
npm install -g vercel
vercel login
```
GitHub 계정으로 로그인.

### Step 3. 프로젝트 디렉터리에서 첫 배포 (Preview)
```bash
cd "OREO/week10/mission2"
vercel
```
질문 답변:
- **Set up and deploy** → `Y`
- **Which scope?** → 본인 계정
- **Link to existing project?** → `N`
- **Project name?** → 그대로 Enter 또는 `oreo-umc-movies` 같은 이름
- **In which directory is your code located?** → 그대로 `.`
- **Want to modify these settings?** → `N`

빌드 끝나면 Preview URL이 뜸 — `https://oreo-umc-movies-xxx.vercel.app`

### Step 4. 환경변수 등록 (필수)
TMDB 토큰이 없으면 검색 API가 401로 실패. **반드시** 등록:

1. Vercel 대시보드 → 방금 만든 프로젝트 → **Settings → Environment Variables**
2. `Add New`:
   - Key: `VITE_TMDB_TOKEN`
   - Value: 로컬 `.env`의 토큰 값 그대로
   - Environment: `Production`, `Preview`, `Development` 모두 체크
3. Save

### Step 5. Production 배포
```bash
vercel --prod
```
- 처음 한 번은 환경변수 적용을 위해 **반드시 재배포** 필요
- Production URL이 출력됨 — `https://oreo-umc-movies.vercel.app`

### Step 6. 새로고침 404 안 나는지 확인
1. Production URL → 영화 검색 → 카드 클릭 → `/movies/12345` 진입
2. **새로고침** → 페이지 정상 표시되어야 함 ✅
3. 만약 404 뜨면 `vercel.json`이 배포에 포함됐는지 확인 (커밋 + push 후 `vercel --prod` 재실행)

### Step 7. (선택) 도메인 연결
1. Vercel 대시보드 → **Domains** → 본인 구입 도메인 입력 → `Add`
2. 도메인 구입처(가비아 등) DNS 설정에서 Vercel이 알려주는 A Record 또는 CNAME 입력
3. Vercel에서 'Configured Correctly' 초록불 확인

---

## 3. 미션 체크리스트

### 준비 단계
- [x] GitHub 레포지토리에 코드 push (`week10_미션2` 브랜치)
- [x] `.env`가 `.gitignore`에 포함됨
- [ ] Vercel CLI 설치 + 로그인 ← **사용자가 직접**

### 프로젝트 연결
- [ ] `vercel` 명령으로 Preview 배포 ← **사용자가 직접**
- [ ] Preview URL 접속 확인 ← **사용자가 직접**

### 실서비스 배포
- [ ] `vercel --prod` 로 Production 배포 ← **사용자가 직접**
- [ ] Production URL 접속 확인 ← **사용자가 직접**

### 필수 설정
- [x] `react-router-dom` 으로 `/movies/:movieId` 라우팅
- [x] `vercel.json` 의 rewrites — 모든 경로를 `/index.html` 로
- [ ] Vercel 대시보드에서 `VITE_TMDB_TOKEN` 환경변수 등록 + 재배포 ← **사용자가 직접**

### 도메인 (선택)
- [ ] 도메인 구입 + Vercel Domains 연결 ← **선택**

---

## 4. 실행 (로컬)

```bash
cp .env.example .env
# VITE_TMDB_TOKEN 채우기

npm install
npm run dev
```

브라우저 → `http://localhost:5173/` → 검색 → 카드 클릭으로 `/movies/123` 진입 확인.

---

## 참고
- [Vercel 배포 가이드 (개발자 매튜)](https://www.yolog.co.kr/post/vercel-deployment)
- [Vercel Rewrites 공식 문서](https://vercel.com/docs/projects/project-configuration#rewrites)
