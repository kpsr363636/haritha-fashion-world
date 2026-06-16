# Haritha Fashion World

Production-ready women's fashion e-commerce marketplace — Spring Boot 3.2 + React 18 + PostgreSQL + Redis.

## Quick Start

```bash
# 1. Start PostgreSQL + Redis (Docker or Homebrew fallback)
chmod +x scripts/*.sh
./scripts/dev-up.sh

# 2. Backend (uses bundled Maven wrapper — no global Maven install needed)
cp backend/.env.example backend/.env
./scripts/verify-backend.sh          # compile check
./scripts/run-backend.sh             # start API (sets JAVA_HOME automatically)
# or: source scripts/use-java.sh && cd backend && ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# 3. Frontend
cp frontend/.env.example frontend/.env
cd frontend && npm install && npm run dev
```

- API: http://localhost:8080/api
- Frontend: http://localhost:5173
- Health: http://localhost:8080/api/health

## Prerequisites

| Tool | Required | Notes |
|------|----------|-------|
| **JDK 18 or 20** | Yes | Scripts auto-select via `scripts/use-java.sh`. **Do not use Java 25** (Lombok fails). You already have JDK 20 installed. |
| **Maven** | No | Use `./backend/mvnw` (Maven Wrapper included) |
| **Docker** | Optional | `./scripts/dev-up.sh` uses Docker Compose if available, otherwise Homebrew PostgreSQL + Redis |
| **Node.js** | Yes | 18+ recommended (16 works with Vite 4) |

### No Docker?

`./scripts/dev-up.sh` falls back to Homebrew:

```bash
brew install postgresql@15 redis
./scripts/dev-up.sh
```

Or install [Docker Desktop](https://www.docker.com/products/docker-desktop/) and re-run the script.

## Demo Accounts (seeded via Flyway V5)

| Role | Mobile | Password | Notes |
|------|--------|----------|-------|
| Admin | 9000000001 | password | `/admin/dashboard` |
| Seller | 9000000002 | password | `/seller/dashboard` |
| Customer | 9000000003 | password | Pre-loaded address, cart, 500 loyalty pts |

**Demo codes:** Coupon `WELCOME10` · Gift card `HFDEMO500` (₹500)

**OTP login (dev):** OTP is logged to the backend console when MSG91 is not configured.

## End-to-End Flow

1. `./scripts/dev-up.sh` — PostgreSQL + Redis
2. `cd backend && ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev` — Flyway seeds demo data
3. `cd frontend && npm run dev` — browse, cart, checkout
4. Login as customer (`9000000003`) via Email tab with password `password`

## Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 17, Spring Boot 3.2, Spring Security 6, JPA |
| Database | PostgreSQL 15 + Flyway migrations |
| Cache | Redis 7 |
| Frontend | React 18, Vite 4, TailwindCSS 3 |
| Payments | Razorpay |
| Shipping | Shiprocket |
| Storage | AWS S3 + CloudFront |
| Auth | JWT + OTP (MSG91) + Google OAuth2 |

## Project Structure

```
harithafashionworld/
├── backend/          # Spring Boot API (includes ./mvnw)
├── frontend/         # React SPA
├── scripts/          # dev-up.sh, verify-backend.sh
├── docker-compose.yml
└── .github/workflows/
```

## Environment

See `backend/.env.example` and `frontend/.env.example` for all required variables.

Brand color: **#B5476A**
