# Week 8 — Mission 3: Sidebar 다시 생각해보기

UMC 10th DAU Web · 8주차 미션 3 — **`useSidebar` 커스텀 훅으로 상태·ESC 닫기·배경 스크롤 잠금을 한 곳에 모으고, 자연스러운 애니메이션과 함께 재사용 가능한 형태로 정리**

미션1/2 베이스(`AppLayout`에 인라인으로 들어가 있던 sidebar 로직)를 `hooks/useSidebar.js`로 추출하고, 누락돼 있던 **body scroll lock**을 추가했습니다.

---

## 🎯 미션 의도 — 제한된 힌트만으로 스스로 조합

이번 미션은 강의 영상을 그대로 따라가는 게 아니라, 이미 배운 개념을 **유기적으로 조합**해서 푸는 게 의도. 사용한 재료들:

| 재료 | 어디서 배웠는지 |
|---|---|
| `useState`로 열림/닫힘 상태 | 2주차 |
| `useEffect`로 keydown 등록 + 클린업 | 3주차 |
| CSS transition (`transform`, `grid-template-columns`) | 0·3주차 |
| 커스텀 훅으로 재사용성 확보 | 4주차 |
| AI/검색을 **도구로** 사용해 처음 보는 패턴(body scroll lock) 해결 | 8주차 미션 의도 |

---

## 1. `useSidebar` 커스텀 훅 (`hooks/useSidebar.js`)

```js
export default function useSidebar(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((v) => !v), [])

  // ESC 닫기
  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e) => { if (e.key === 'Escape') setIsOpen(false) }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen])

  // body scroll lock
  useEffect(() => {
    if (!isOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prevOverflow }
  }, [isOpen])

  return { isOpen, open, close, toggle }
}
```

설계 포인트:
- **인터페이스가 작다** — `{ isOpen, open, close, toggle }` 네 가지만. 어디서 써도 똑같이 동작
- **ESC listener는 `isOpen=true`일 때만 등록** — 닫혀 있을 때 키보드 이벤트 부하 0
- **scroll lock도 같은 패턴** — 닫힐 때 cleanup이 자동으로 직전 `overflow` 값을 복원하므로, 다른 곳에서 `overflow: hidden`을 쓰고 있어도 덮어쓰는 사고가 없음
- **`useCallback`** — 반환 함수 reference가 매 렌더마다 새로 만들어지지 않아 자식 컴포넌트의 메모화·deps 안전

---

## 2. AppLayout 리팩터링 (`layout/AppLayout.jsx`)

기존(미션2까지):
```jsx
const [sidebarOpen, setSidebarOpen] = useState(initialOpen)
useEffect(() => {
  if (!sidebarOpen) return
  const onKey = (e) => { if (e.key === 'Escape') setSidebarOpen(false) }
  document.addEventListener('keydown', onKey)
  return () => document.removeEventListener('keydown', onKey)
}, [sidebarOpen])
const close = () => setSidebarOpen(false)
const toggle = () => setSidebarOpen((v) => !v)
```

이번 미션:
```jsx
const { isOpen: sidebarOpen, close, toggle } = useSidebar(initialOpen())
```

라인 수만 줄어든 게 아니라, body scroll lock 같은 부수 효과를 추가할 때 **AppLayout이 아니라 훅 한 곳**만 손대면 되도록 응집도가 올라갔다.

---

## 3. 애니메이션 (Tailwind transition 컨셉 그대로 CSS로)

`App.css`에 이미 들어가 있는 것을 그대로 활용 (Tailwind를 안 쓰는 프로젝트라 vanilla CSS로):

- 데스크탑 (>= 768px): `.app-layout { transition: grid-template-columns 0.22s ease; }` — grid의 컬럼이 부드럽게 줄어들면서 사이드바가 자연스럽게 닫힘
- 모바일 (< 768px): `.app-sidebar { transform: translateX(-100%); transition: transform 0.22s ease; }` + `.app-sidebar.open { transform: translateX(0); }` — 슬라이드 인/아웃
- 백드롭: `.sidebar-backdrop` opacity 트랜지션으로 부드럽게 페이드

Tailwind 사용 시 동등 클래스: `transition-transform duration-200 ease-out` / `transition-[grid-template-columns]`.

---

## 4. 배경 스크롤 잠금 — 검색·해결 기록

### 어떻게 검색했나
- 처음에는 사이드바가 열린 상태에서 모바일 뷰포트로 페이지를 위·아래로 휠/터치 스크롤하면 뒤의 콘텐츠가 같이 움직이는 걸 확인 (`pages/Home.jsx`에 일부러 긴 텍스트 15개 문단을 박아둠).
- 검색 키워드 시도:
  1. `react sidebar background scroll prevent` → 모달 관련 결과만 잔뜩
  2. `modal body scroll lock react useEffect` ← 이 조합이 가장 유효했음
  3. `body scroll lock library react` → `body-scroll-lock` 라이브러리가 나오는데, 의존성 추가까지 갈 필요는 없어 보였음

### 발견한 후보들 비교

| 방법 | 장점 | 단점 | 채택? |
|---|---|---|---|
| `document.body.style.overflow = 'hidden'` + cleanup으로 복원 | 의존성 없음, 한 줄로 끝 | iOS Safari 일부 케이스에서 여전히 bounce 가능 (이 프로젝트엔 영향 없음) | ✅ |
| `position: fixed` + `top: -scrollY` 트릭 | iOS bounce까지 막음 | 스크롤 복원 로직이 따로 필요, 코드 복잡도↑ | ❌ |
| `body-scroll-lock` 라이브러리 | 모든 케이스 처리 | 의존성 추가, 학습 목표 대비 과함 | ❌ |
| `overscroll-behavior: contain` | 가볍지만 | 모달/사이드바 박스 안에서만 통하고 body 자체엔 효과 약함 | ❌ |

### 채택한 코드
```js
useEffect(() => {
  if (!isOpen) return
  const prevOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  return () => { document.body.style.overflow = prevOverflow }
}, [isOpen])
```

- **`useEffect` cleanup이 핵심**: 사이드바가 닫히거나 컴포넌트가 언마운트되면 자동으로 직전 값으로 되돌아감 — 다른 화면에서 `overflow`를 만져도 사이드바가 그걸 덮어쓰지 않음
- **3주차에서 배운 cleanup 패턴**이 그대로 적용되는 자리: 부수 효과를 만들면 항상 짝이 되는 cleanup을 같이 짠다

---

## 5. 미션 체크리스트

### 1) Sidebar UI 구현 및 애니메이션
- [x] Sidebar UI 구현 (헤더의 햄버거 ↔ 좌측 nav)
- [x] CSS transition으로 자연스럽게 열고 닫힘
  - 데스크탑: `grid-template-columns 0.22s ease`
  - 모바일: `transform translateX 0.22s ease` + 백드롭 opacity 페이드

### 2) `useSidebar` 커스텀 훅
- [x] `isOpen` 상태
- [x] `open()` / `close()` / `toggle()` 함수
- [x] 햄버거 클릭 → `toggle()` / 백드롭 클릭 → `close()` / 모바일 nav 링크 클릭 → `close()`
- [x] 모두 `useSidebar` 훅으로 묶어 재사용성 확보

### 3) 접근성 — ESC 닫기
- [x] `keydown` 리스너로 Escape 처리
- [x] `useEffect` cleanup에서 `removeEventListener` (메모리 누수 방지)
- [x] `isOpen=false`일 땐 리스너 자체를 등록하지 않음

### 4) 사용성 — 배경 스크롤 방지
- [x] 긴 텍스트(`pages/Home.jsx`의 LONG_PARAGRAPHS)로 스크롤 가능 상태 만들어 문제 인지
- [x] `document.body.style.overflow = 'hidden'` + cleanup 복원으로 해결
- [x] 검색 키워드·후보 비교·채택 근거를 위에 기록

---

## 실행

```bash
cd backend
cp .env.example .env
npm install
npm run dev   # localhost:8000

cd ..
npm install
npm run dev   # localhost:5173
```

브라우저 폭을 768px 이하로 좁히고 햄버거를 눌러 사이드바를 열면:
- 자연스럽게 슬라이드 인 (`transform`)
- 백드롭이 페이드 인
- 뒤의 Home 콘텐츠가 스크롤되지 않음 ✅
- ESC 누르면 닫힘 ✅
- 백드롭 클릭해도 닫힘 ✅
