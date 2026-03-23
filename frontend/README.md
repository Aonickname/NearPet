# NearPet Frontend

NearPet의 랜딩 페이지, 갤러리, 예약, 로그인, 관리자 화면을 제공하는 React SPA입니다.

**기술 스펙**
- Language: JavaScript
- Framework: React 19.2.4
- Router: React Router DOM 7.13.1
- Build tool: Create React App (`react-scripts` 5.0.1)
- Package manager: npm
- Styling: CSS stylesheet 기반

**주요 화면**
- 랜딩 페이지
- 홈 / 대표 사진 갤러리
- 전체 갤러리
- 로그인 / 회원가입
- 예약 생성 / 조회 / 수정
- 관리자 사진 / 예약 / 알림 설정 화면

**필수 환경변수**
```env
REACT_APP_API_BASE_URL=http://localhost:8080/api
```

이 값만 바꾸면 프론트가 호출하는 API 서버 주소가 바뀝니다.
프론트 코드 안에는 서버 IP를 하드코딩하지 않고 이 환경변수만 사용합니다.

**실행 방법**
1. `.env.example`을 복사해 `.env`를 만듭니다.
2. 의존성을 설치합니다.

```bash
npm install
```

개발 서버:
```bash
npm start
```

프로덕션 빌드:
```bash
npm run build
```

정적 서빙 예시:
```bash
npx serve -s build -p 3000
```

**프로젝트 구조**
- `src/`: 애플리케이션 코드
- `src/api.js`: API 통신 공통 처리
- `src/pages/`: 화면 컴포넌트
- `src/styles/`: 전역 스타일
- `public/`: 정적 템플릿 및 기본 에셋
- `build/`: 배포용 산출물

**운영 메모**
- 프론트 코드 안에는 서버 IP를 하드코딩하지 않고 `REACT_APP_API_BASE_URL`만 사용합니다.
- 백엔드는 현재 사용자 정보, 사진 메타데이터, 예약 데이터, 관리자 설정을 MySQL에 저장합니다.
- 업로드 원본 파일은 백엔드 로컬 스토리지(`data/uploads`)에 저장됩니다.
- `.env`는 공개 저장소에 포함하지 않습니다.
- 빌드 결과물 `build/`는 재생성 가능하므로 Git에 포함하지 않습니다.
