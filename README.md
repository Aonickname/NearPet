# NearPet

NearPet은 반려동물 사진 스튜디오를 위한 웹 서비스입니다. 현재 저장소는 React 프론트엔드와 Spring Boot 백엔드를 하나의 레포지토리에서 함께 관리합니다.

## 구성
- `frontend`: 사용자용 React SPA
- `backend`: Spring Boot API 서버
- `backend/data/uploads`: 업로드 원본 이미지 저장 디렉터리
- `backend/db/mysql-init.sql`: 초기 MySQL 생성 스크립트

## 현재 기능
- 랜딩 페이지 및 브랜드 링크 페이지
- 대표 사진 홈 화면
- 전체 갤러리
- 회원가입 / 로그인
- 관리자 사진 관리
- 관리자 설정 관리
- 예약 데이터 API 및 관리자 예약 관리

참고:
- 프론트에서는 현재 예약 진입 동선이 비활성화되어 있습니다.
- 예약 관련 백엔드 API와 데이터 구조는 유지되어 있어 추후 다시 활성화할 수 있습니다.

## 기술 스택
- Frontend: React, React Router, CSS
- Backend: Java 17, Spring Boot 3.3.5, Gradle, Spring Data JPA
- Database: MySQL
- Infra: AWS Lightsail, nginx, Let's Encrypt

## 데이터 저장 구조
- 사용자 정보: MySQL
- 사진 메타데이터: MySQL
- 예약 데이터: MySQL
- 관리자 설정: MySQL
- 업로드 원본 파일: `backend/data/uploads`

## 폴더 구조
```text
nearpet/
├── README.md
├── frontend/
│   ├── README.md
│   ├── .env.example
│   ├── package.json
│   └── src/
├── backend/
│   ├── README.md
│   ├── .env.example
│   ├── build.gradle
│   ├── gradlew
│   ├── db/mysql-init.sql
│   ├── data/
│   └── src/main/
└── .gitignore
```

## 환경 변수
실제 실행값은 각 앱의 `.env`에서 관리합니다.

- 프론트 예시: [frontend/.env.example](/Users/sebin/Desktop/coding/projects/nearpet/frontend/.env.example)
- 백엔드 예시: [backend/.env.example](/Users/sebin/Desktop/coding/projects/nearpet/backend/.env.example)

실제 `.env`는 Git에 포함하지 않습니다.

## 로컬 실행

### Backend
상세 문서: [backend/README.md](/Users/sebin/Desktop/coding/projects/nearpet/backend/README.md)

```bash
cd backend
./gradlew bootRun
```

### Frontend
상세 문서: [frontend/README.md](/Users/sebin/Desktop/coding/projects/nearpet/frontend/README.md)

```bash
cd frontend
npm install
npm start
```

## 서버 배포 개요
현재 운영 기준은 다음과 같습니다.

- 프론트: `npm run build` 후 `serve -s build -p 3000`
- 백엔드: `java -jar build/libs/nearpet-backend-0.0.1-SNAPSHOT.jar`
- 리버스 프록시: nginx
- 공개 주소: `https://nearpet.co.kr`
- API 경로: `/api`

일반적인 배포 순서:
1. 서버에 저장소 clone
2. `frontend/.env`, `backend/.env` 생성
3. 백엔드 JAR 빌드
4. 프론트 빌드
5. nginx로 `80/443`에서 프론트와 `/api` 프록시
6. certbot으로 HTTPS 발급

## Git 운영 메모
- 서버에서는 보통 `git clone`을 매번 다시 하지 않고 `git pull origin main`으로 업데이트합니다.
- `.env`는 Git 추적 대상이 아니므로 일반적인 `git pull`에서는 유지됩니다.
- 다만 서버 폴더를 삭제하고 새로 clone하면 `.env`는 다시 복사해야 합니다.

## 참고 문서
- 루트 문서: [README.md](/Users/sebin/Desktop/coding/projects/nearpet/README.md)
- 프론트 문서: [frontend/README.md](/Users/sebin/Desktop/coding/projects/nearpet/frontend/README.md)
- 백엔드 문서: [backend/README.md](/Users/sebin/Desktop/coding/projects/nearpet/backend/README.md)
