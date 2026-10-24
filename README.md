# Secure Smart Apartment & Society Management Platform

A production-style, full-stack enterprise web platform designed for single apartment/society management.

---

## 🏛️ System Architecture

- **Frontend**: React.js, TypeScript, Vite, Tailwind CSS, React Router, Axios
- **Backend**: Java 17/21, Spring Boot 3.x, Spring Security (JWT, BCrypt, RBAC), Spring Data JPA (Hibernate)
- **Database**: MySQL 8.0
- **Intelligent Engine**: Java Rule-Based Keyword & Frequency Analytics Engine (Embedded inside Spring Boot)
- **Real-Time (Optional Phase 2)**: STOMP WebSockets
- **Payments (Optional Phase 2)**: Razorpay Sandbox Integration
- **Containerization**: Docker & Docker Compose

```
React Frontend (Vite)
        │
        ▼  REST APIs
Spring Boot Backend (Java 17/21 Modular Monolith)
        │
        ├──► Java Intelligent Analytics Engine (Rule-based Classification & Predictive Maintenance)
        └──► MySQL 8 Database
```

---

## 🔐 Security & Access Control Model

### Explicit Roles (No Super Admin)
1. **Society Admin**: Highest administrative authority over flats, residents, complaints, maintenance billing, parking allocations, staff, and audit logs.
2. **Resident**: Manages profile, invites visitors, approves entry, marks trusted visitors, registers household service providers, pays maintenance dues, books facilities, posts on marketplace & to-let.
3. **Security Guard**: Gate verification, QR pass scanning, entry/exit logging, trusted visitor lookup, parcel receipt logging.
4. **Maintenance Staff**: Electricians, plumbers, cleaners, gardeners viewing assigned complaint work tickets, updating work status, and attendance.

---

## 🧠 Java-Native Intelligent Services

1. **Intelligent Complaint Prioritization**: Evaluates complaint categories, keyword severity matrices (`URGENT`, `HIGH`, `MEDIUM`, `LOW`), affected resident scope, and emergency indicators directly in Java.
2. **Predictive Maintenance**: Statistical frequency analysis identifying high-risk maintenance equipment (pumps, elevators, circuit breakers) and recommending preventive maintenance schedules.

---

## 🚀 Quick Start & Deployment Guide

### Option 1: Docker Compose (Recommended)
Build and launch the entire stack (MySQL, Backend, Frontend):

```bash
docker-compose up --build -d
```

- Frontend App: `http://localhost`
- Backend API: `http://localhost:8080/api`


### Option 2: Local Development Setup

#### 1. MySQL Database
Create database `ssasm_db`:
```sql
CREATE DATABASE ssasm_db;
```

#### 2. Backend (Spring Boot)
```bash
cd backend
mvn clean spring-boot:run
```

#### 3. AI Service (Python FastAPI)
```bash
cd ai-service
pip install -r requirements.txt
python main.py
```

#### 4. Frontend (React Vite)
```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Testing Summary

- **Backend JUnit 5 / Mockito**: Run `mvn test` in `./backend`
- **Frontend Type Verification**: Run `npx tsc --noEmit` in `./frontend`
- **Vite Production Build**: Run `npm run build` in `./frontend`

---

## 🎓 Viva & Seminar Q&A Quick Reference

1. **Why Single Society Architecture?**  
   Designed for real-world society management where Society Admin is the highest operational authority, avoiding multi-tenant super admin complexity.
2. **How does the Trusted Visitor feature work?**  
   First visit requires resident OTP/approval. Once marked as Trusted (e.g. daily maid/cook), security verifies phone/photo for instant gate entry without repeated calls.
3. **Why Scikit-learn instead of OpenAI/Claude APIs?**  
   Ensures 100% data privacy, zero external API costs, zero internet dependency, and sub-millisecond local inference time.
