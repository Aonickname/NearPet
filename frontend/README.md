# NearPet Frontend

NearPet 프론트엔드는 React 기반 사용자 웹 앱입니다. 랜딩 페이지, 홈, 갤러리, 인증 화면, 관리자 화면을 포함한 SPA 구조로 구성되어 있습니다.

## 스택
- JavaScript
- React 19
- React Router DOM 7
- Create React App (`react-scripts` 5)
- CSS stylesheet 기반 스타일링

## 주요 화면
- 랜딩 페이지
- 홈 / 대표 사진 갤러리
- 전체 갤러리
- 로그인 / 회원가입
- 관리자 화면

참고:
- 예약 관련 백엔드 기능은 유지되어 있지만, 현재 프론트에서는 예약 진입 동선이 비활성화되어 있습니다.
- `/reserve` 경로는 직접 진입 시 홈으로 리다이렉트되도록 정리되어 있습니다.

## 주요 파일
- `src/App.js`: 라우팅 구성
- `src/api.js`: API 호출 공통 처리
- `src/components/Header.js`: 상단 헤더
- `src/pages/Landing.js`: 랜딩 페이지
- `src/pages/Home.js`: 메인 홈
- `src/pages/Gallery.js`: 전체 갤러리
- `src/pages/Admin.js`: 관리자 화면
- `src/styles/global.css`: 공통 스타일

## 환경 변수
기본 예시는 [frontend/.env.example](/Users/sebin/Desktop/coding/projects/nearpet/frontend/.env.example)에 있습니다.

### 로컬 개발 예시
```env
REACT_APP_API_BASE_URL=http://localhost:8080/api
```

### 운영 예시
```env
REACT_APP_API_BASE_URL=/api
```

운영 환경에서는 nginx가 `/api`를 백엔드 `8080`으로 프록시하므로 상대 경로 `/api`를 사용하는 구성이 가장 깔끔합니다.

## 실행
```bash
cd /Users/sebin/Desktop/coding/projects/nearpet/frontend
npm install
npm start
```

기본 개발 서버:
- `http://localhost:3000`

## 빌드
```bash
cd /Users/sebin/Desktop/coding/projects/nearpet/frontend
npm run build
```

빌드 결과:
- `build/`

정적 서빙 예시:
```bash
npx serve -s build -p 3000
```

백그라운드 실행 예시:
```bash
nohup npx serve -s build -p 3000 > frontend.log 2>&1 &
```

참고:
- `serve`는 이미 생성된 `build/`를 서빙만 합니다.
- 코드 수정 후에는 반드시 `npm run build`를 다시 실행해야 변경 내용이 반영됩니다.

## 모바일 UI
현재 랜딩 페이지는 모바일 Safari 기준으로 여백과 카드 폭을 조정하는 작업이 반영되어 있습니다. 실제 확인은 다음 방법을 권장합니다.

- Mac Safari의 반응형 디자인 모드
- 실제 iPhone Safari 실기기 확인

## 운영 메모
- 실제 공개 주소는 `https://nearpet.co.kr`
- 프론트는 보통 `3000` 포트에서 내부 서빙되고, 외부에는 nginx가 `80/443`으로 노출합니다.
- `.env`, `build/`는 Git에 포함하지 않습니다.
- 프론트는 백엔드 API 주소를 코드에 직접 하드코딩하지 않고 `REACT_APP_API_BASE_URL`만 사용합니다.
