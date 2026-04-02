# NearPet Backend

NearPet 백엔드는 인증, 사진 관리, 예약 데이터, 관리자 설정 API를 제공하는 Spring Boot 애플리케이션입니다.

## 스택
- Java 17
- Gradle
- Spring Boot 3.3.5
- Spring Web
- Spring Validation
- Spring Data JPA
- MySQL
- Spring Mail
- `spring-dotenv`

## 주요 역할
- 회원가입 / 로그인 처리
- 사진 메타데이터 CRUD
- 업로드 파일 경로 관리
- 예약 데이터 저장 및 조회
- 관리자 설정 저장

## 저장 구조
- 사용자 정보: MySQL `app_users`
- 사진 메타데이터: MySQL `photos`
- 예약 데이터: MySQL `reservations`
- 관리자 설정: MySQL `admin_settings`
- 업로드 원본 파일: `data/uploads`

## 주요 디렉터리
- `src/main/java/com/nearpet/backend`: 핵심 소스 코드
- `src/main/resources/application.yml`: Spring 설정
- `data/`: 런타임 파일 저장 위치
- `.env`: 실제 환경 변수
- `.env.example`: 공유용 예시 환경 변수
- `db/mysql-init.sql`: 초기 DB/테이블 생성용 SQL

## 환경 변수
기본 예시는 [backend/.env.example](/Users/sebin/Desktop/coding/projects/nearpet/backend/.env.example)에 있습니다.

### 로컬 예시
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

### 운영 예시
```env
BACKEND_SERVER_PORT=8080
BACKEND_PUBLIC_BASE_URL=https://nearpet.co.kr
FRONTEND_BASE_URL=https://nearpet.co.kr
FRONTEND_BASE_URLS=https://nearpet.co.kr,https://www.nearpet.co.kr
DB_URL=jdbc:mysql://<LIGHTSAIL_DB_ENDPOINT>:3306/nearpet?useSSL=true&serverTimezone=Asia/Seoul&characterEncoding=UTF-8
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

참고:
- `HIBERNATE_DIALECT`는 현재 설정상 생략 가능하지만, 예시에는 유지해두었습니다.
- `.env`는 애플리케이션을 실행하는 현재 작업 디렉터리 기준으로 읽히므로, 반드시 `backend` 루트에서 실행하는 것을 권장합니다.

## 실행
`.env.example`을 복사해 `.env`를 만든 뒤 실행합니다.

```bash
cd /Users/sebin/Desktop/coding/projects/nearpet/backend
./gradlew bootRun
```

## 빌드
```bash
cd /Users/sebin/Desktop/coding/projects/nearpet/backend
./gradlew clean bootJar
```

산출물:
- `build/libs/nearpet-backend-0.0.1-SNAPSHOT.jar`

실행:
```bash
cd /Users/sebin/Desktop/coding/projects/nearpet/backend
java -jar build/libs/nearpet-backend-0.0.1-SNAPSHOT.jar
```

## 데이터베이스 초기화
초기 SQL은 [mysql-init.sql](/Users/sebin/Desktop/coding/projects/nearpet/backend/db/mysql-init.sql)을 사용할 수 있습니다.

기본 흐름:
1. MySQL 데이터베이스 `nearpet` 생성
2. 앱 전용 사용자 생성
3. 테이블 생성
4. 애플리케이션 실행

`JPA_DDL_AUTO=update` 상태에서는 애플리케이션 시작 시 스키마 변경이 반영될 수 있습니다.

## 레거시 데이터 이관
기존 JSON 파일이 있으면, 비어 있는 테이블에 한해 초기 1회 import를 시도합니다.

- `data/photos.json`
- `data/reservations.json`
- `data/admin-settings.json`

## 운영 메모
- 운영 환경에서는 nginx가 `/api`를 이 백엔드의 `8080` 포트로 프록시합니다.
- 실제 외부 공개 주소는 보통 `https://nearpet.co.kr`이며, 백엔드는 내부적으로 `8080`에서 실행됩니다.
- 업로드 파일만 `data/uploads`에 남고 나머지 주요 데이터는 MySQL에 저장됩니다.
- `.env`, `build/`, 런타임 업로드 파일은 Git에 포함하지 않습니다.
