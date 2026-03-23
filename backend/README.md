# NearPet Backend

NearPet의 인증, 예약, 사진, 관리자 설정 API를 제공하는 Spring Boot 백엔드입니다.

현재 저장 구조:
- 사용자 정보: MySQL
- 사진 메타데이터: MySQL
- 예약 데이터: MySQL
- 관리자 설정: MySQL
- 업로드 원본 파일: 로컬 `data/uploads`

## Stack
- Java 17
- Gradle
- Spring Boot 3.3.5
- Spring Web
- Spring Validation
- Spring Data JPA
- MySQL
- Spring Mail
- spring-dotenv

## Directory
- `src/main/java/com/nearpet/backend`: 핵심 백엔드 소스
- `src/main/resources/application.yml`: 런타임 설정
- `data/`: 로컬 파일 저장 디렉터리
- `.env`: 로컬/서버 개별 환경값
- `.env.example`: 공유용 예시 환경값

## Required Environment Variables
```env
BACKEND_SERVER_PORT=8080
BACKEND_PUBLIC_BASE_URL=http://localhost:8080
FRONTEND_BASE_URL=http://localhost:3000
FRONTEND_BASE_URLS=http://localhost:3000,http://127.0.0.1:3000
DB_URL=jdbc:mysql://localhost:3306/nearpet?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Seoul&characterEncoding=UTF-8
DB_DRIVER=com.mysql.cj.jdbc.Driver
DB_USERNAME=nearpet
DB_PASSWORD=nearpet1234
JPA_DDL_AUTO=update
HIBERNATE_DIALECT=org.hibernate.dialect.MySQLDialect
MAIL_HOST=
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_SMTP_AUTH=true
MAIL_STARTTLS_ENABLE=true
MAIL_FROM=
```

## Run
`.env.example`을 복사해 `.env`를 만든 뒤 실행합니다.

```bash
gradle bootRun
```

## Build
```bash
gradle clean bootJar
```

산출물:
- `build/libs/nearpet-backend-0.0.1-SNAPSHOT.jar`

실행:
```bash
java -jar build/libs/nearpet-backend-0.0.1-SNAPSHOT.jar
```

## MySQL
- 로컬 MySQL을 기준으로 `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`를 `.env`에서 관리합니다.
- 초기 DB/테이블 생성 SQL은 `db/mysql-init.sql`을 사용하면 됩니다.
- `JPA_DDL_AUTO=update` 상태에서는 기본 테이블 변경도 애플리케이션 시작 시 반영됩니다.
- `app_users`, `photos`, `reservations`, `admin_settings` 테이블은 MySQL을 사용합니다.

## Notes
- `.env`는 Git에 포함되지 않습니다.
- 사용자 정보, 사진 메타데이터, 예약 데이터, 관리자 설정은 MySQL에 저장됩니다.
- 업로드 파일만 런타임에 `data/uploads` 아래 생성됩니다.
- 기존 `reservations.json`, `admin-settings.json`, `photos.json`이 있으면 비어 있는 테이블로 초기 1회 가져옵니다.
- 공개 저장소에는 실제 서버 주소나 비밀 값 대신 `.env.example`만 포함합니다.
