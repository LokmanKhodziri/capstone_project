# ExpenseTracker

**ExpenseTracker** is a full-stack expense tracking application (Spring Boot backend + React frontend) used for a capstone project. This README explains how to run the project locally (with Docker), run tests, and how CI is configured.

**Tech Stack:**

- **Backend:** Spring Boot (Java 17), Maven
- **Frontend:** React, Axios
- **Database:** MySQL (production), H2 (tests)
- **Auth:** JWT with BCrypt password hashing
- **Infra:** Docker, Docker Compose, Jenkins

**Repository layout**

- `backend/` – Spring Boot application and `Jenkinsfile`
- `frontend/` – React app
- `docker-compose.yml` – Compose file to run `mysql-db` + `app` locally

**Quick Start (Docker)**

Prerequisites:

- Docker & Docker Compose installed

Run the app and DB with Docker Compose:

```bash
# from repo root
docker-compose up -d --build
```

This starts two containers:

- `mysql-db` (MySQL 8)
- `expense-tracker-backend` (the Spring Boot app)

The backend maps to `localhost:8082` by default (see `backend/src/main/resources/application.properties` `server.port`).

API endpoints use the `/api` prefix (e.g. `/api/auth/login`). The frontend expects the backend at `http://localhost:8082`.

**Run backend locally (without Docker)**

Prerequisites: Java 17, Maven

```bash
cd backend
./mvnw spring-boot:run
```

**Run frontend locally**

Prerequisites: Node.js & npm

```bash
cd frontend
npm install
npm start
```

**Authentication & Admin account**

- The application uses JWTs. The secret is configured in `backend/src/main/resources/application.properties` as `jwt.secret` and must be a valid Base64 string.
- Default admin credentials (seeded on startup via `DataInitializer`):

```
username: admin
password: Admin123!
role: ADMIN
```

- Default regular users (seeded): `user1` .. `user20` — password `Password123!`

You can test login via curl:

```bash
curl -X POST http://localhost:8082/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin123!"}'
```

**Database & Tests**

- Production DB: MySQL. Compose file creates a database `expensetracker` and a `mysql-db` service.
- Tests use an in-memory H2 database. There is a `src/test/resources/application.properties` that configures H2 so CI/test runs do not require MySQL.

**Jenkins / CI notes**

- The `backend/Jenkinsfile` runs Maven from the `backend/` directory (`dir('backend')`) to ensure `mvnw` and `pom.xml` are found.
- The Jenkins pipeline includes a stage to provision a MySQL container (named dynamically) and poll for readiness before running tests.

**Common troubleshooting**

- JWT decoding error (Illegal base64 character): Ensure `jwt.secret` in `backend/src/main/resources/application.properties` is a valid base64 string; invalid characters (like `_` or `-`) will cause runtime errors from the JJWT library.
- If login returns 500: check backend logs:

```bash
docker logs expense-tracker-backend --tail 200
# or
docker-compose logs -f app
```

- If users are missing, ensure the backend was restarted after editing `application.properties` so `DataInitializer` runs and seeds users.

**Important files to review**

- `backend/src/main/resources/application.properties` — DB, jwt secret, seeded users
- `backend/src/main/java/com/expensetracker/config/DataInitializer.java` — seeding logic for admin/users
- `backend/src/main/java/com/expensetracker/config/JwtUtil.java` — JWT signing and validation
- `backend/Jenkinsfile` — CI pipeline

**Security note**

- Do not commit production secrets. The `jwt.secret` in this repository is for local/dev use only. For production, store secrets in a secure vault or environment variables and ensure the secret is a proper Base64 string with sufficient entropy.

---

If you want, I can also:

- Add a short developer checklist (build→run→smoke tests)
- Add an example `.env` template for local overrides
- Create a quick Postman collection with the main endpoints

If you'd like any of those, tell me which one and I'll add it.
