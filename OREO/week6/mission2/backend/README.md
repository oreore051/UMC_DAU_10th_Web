# UMC Week5 Stub Backend

Mission 2 (Refresh Token) · Mission 3 (Google OAuth) 검증용 stub Express 서버.

## 설치 & 실행

```bash
cd mission3/backend
npm install
npm run dev    # node --watch (파일 저장 시 자동 재시작)
# 또는
npm start
```

기본 포트: **8000**

데모 계정 (서버 부팅 시 자동 시드):
- email: `umc@umc.com`
- password: `1234`

## API

| Method | Path | 설명 |
|---|---|---|
| `POST` | `/v1/auth/signup` | `{ email, password, name? }` → 토큰 발급 |
| `POST` | `/v1/auth/login` | `{ email, password }` → 토큰 발급 |
| `POST` | `/v1/auth/refresh` | `{ refreshToken }` → 새 토큰 페어 (rotation, 기존 폐기) |
| `POST` | `/v1/auth/logout` | `{ refreshToken }` → refresh token 폐기 |
| `GET`  | `/v1/users/me` | `Authorization: Bearer <accessToken>` → 유저 정보 |
| `GET`  | `/v1/auth/google/login` | Google 로그인 페이지로 리다이렉트 |
| `GET`  | `/v1/auth/google/callback` | code 교환 후 프론트로 토큰 동봉해 리다이렉트 |

## 환경변수 (.env)

```env
PORT=8000
JWT_SECRET=...
JWT_EXPIRES_IN=30s          # 미션 2 검증용으로 짧게. 운영에서는 보통 15m~1h
REFRESH_JWT_SECRET=...
REFRESH_JWT_EXPIRES_IN=7d

FRONTEND_ORIGIN=http://localhost:5173

# Mission 3에서만 필요
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:8000/v1/auth/google/callback
```

## 특징

- **In-memory 저장소** (`store.js`) — Map 하나로 유저 관리. 서버 재시작 시 초기화.
- **Refresh Token Rotation** — `/refresh` 호출 시 기존 토큰을 화이트리스트에서 즉시 삭제하고 새 페어 발급. 탈취된 토큰의 재사용을 차단.
- **Token expiry 30s** — 미션 2 검증을 빠르게 하려는 의도. 충분히 검증한 뒤에는 `JWT_EXPIRES_IN=15m` 정도로 늘려 두어도 OK.

## 빠른 동작 확인

```bash
# 1) 로그인
curl -X POST http://localhost:8000/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"umc@umc.com","password":"1234"}'

# 2) 보호된 엔드포인트
curl http://localhost:8000/v1/users/me \
  -H 'Authorization: Bearer <accessToken>'

# 3) refresh
curl -X POST http://localhost:8000/v1/auth/refresh \
  -H 'Content-Type: application/json' \
  -d '{"refreshToken":"<refreshToken>"}'
```
