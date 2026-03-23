# NearPet

반려동물 스튜디오 예약과 사진 관리를 위한 웹 서비스입니다.

## Overview
- `frontend`: React 기반 사용자 웹 앱
- `backend`: Spring Boot 기반 API 서버

주요 기능:
- 반려동물 사진 갤러리 조회
- 회원가입 / 로그인
- 예약 생성 / 수정 / 삭제
- 관리자 사진 관리
- 관리자 알림 이메일 설정

## Tech Stack
- Frontend: React, React Router, CSS
- Backend: Java 17, Spring Boot 3.3.5, Gradle, Spring Data JPA
- Database: MySQL
- Storage: 업로드 원본 파일은 로컬 스토리지(`backend/data/uploads`)

## Project Structure
```text
nearpet/
├── frontend/
│   ├── README.md
│   └── src/
├── backend/
│   ├── README.md
│   ├── db/mysql-init.sql
│   └── src/main/java/com/nearpet/backend/
└── .gitignore
```

## Environment Variables
환경별 주소, DB 접속 정보, 메일 설정은 각 앱의 `.env`에서 관리합니다.

- Frontend env example:
  - `/frontend/.env.example`
- Backend env example:
  - `/backend/.env.example`

실제 `.env` 파일은 Git에 포함하지 않습니다.

## Run
### 1. Backend
상세 설명:
- [backend/README.md](/Users/sebin/Desktop/coding/projects/nearpet/backend/README.md)

요약:
```bash
cd backend
gradle bootRun
```

### 2. Frontend
상세 설명:
- [frontend/README.md](/Users/sebin/Desktop/coding/projects/nearpet/frontend/README.md)

요약:
```bash
cd frontend
npm install
npm start
```

## Database
- MySQL 사용
- 초기 DB/테이블 생성 SQL:
  - [backend/db/mysql-init.sql](/Users/sebin/Desktop/coding/projects/nearpet/backend/db/mysql-init.sql)

현재 저장 위치:
- 사용자 정보: MySQL
- 사진 메타데이터: MySQL
- 예약 데이터: MySQL
- 관리자 설정: MySQL
- 업로드 원본 파일: `backend/data/uploads`

## Notes
- 서버 주소와 IP는 코드에 하드코딩하지 않고 `.env`에서 관리합니다.
- `frontend/build`, `backend/build`, `.env`, 런타임 데이터는 Git에서 제외합니다.
- 하위 앱별 상세 실행/설정 방법은 각 폴더의 README를 참고하면 됩니다.
