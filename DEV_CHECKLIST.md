Developer Checklist — ExpenseTracker

1. Build backend

```bash
cd backend
./mvnw clean package -DskipTests
```

2. Run backend (dev)

```bash
cd backend
./mvnw spring-boot:run
# or run the packaged jar
java -jar target/ExpenseTracker-0.0.1-SNAPSHOT.jar
```

3. Run frontend (dev)

```bash
cd frontend
npm install
npm start
```

4. Run full stack locally with Docker Compose

```bash
# from repo root
docker-compose up -d --build
```

5. Run backend unit tests

```bash
cd backend
./mvnw test
```

6. Smoke test

```bash
# Login and confirm a protected endpoint works
curl -X POST http://localhost:8082/api/auth/login -H "Content-Type: application/json" -d '{"username":"admin","password":"Admin123!"}'
# then
curl -X GET http://localhost:8082/api/user/me -H "Authorization: Bearer <token>"
```
