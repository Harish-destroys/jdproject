# SecondServe – Backend Architecture (Java Spring Boot & MySQL)

This directory contains the production-grade Java Spring Boot 3 + MySQL backend source code and SQL schema for the **SecondServe – Surplus Food Rescue Coordination System** college project.

---

## 1. Prerequisites
- **Java Development Kit (JDK):** Version 17 or 21
- **Apache Maven:** 3.8+
- **MySQL Server:** Version 8.0+

---

## 2. MySQL Database Setup
1. Start your local MySQL service.
2. Open MySQL Workbench or your terminal and run:
```sql
CREATE DATABASE secondserve_db;
USE secondserve_db;
SOURCE src/main/resources/schema.sql;
SOURCE src/main/resources/data.sql;
```

---

## 3. Database Credentials Configuration
Edit `src/main/resources/application.properties` with your MySQL username and password:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/secondserve_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

---

## 4. Running the Spring Boot Application
From this `/backend` directory, execute:
```bash
mvn clean spring-boot:run
```
The REST API server will start on port `8080`.

---

## 5. Key REST API Endpoints
- `GET /api/donations` – Fetch available surplus food batches
- `POST /api/donations` – Restaurant donor adds new surplus food
- `POST /api/donations/{id}/request` – NGO requests food batch (locks against duplicate claims)
- `POST /api/donations/{id}/approve` – Donor confirms and approves request
- `POST /api/donations/{id}/transition?nextStatus={STATUS}` – Updates tracking status through the 7 stages:
  `LISTED` → `REQUESTED` → `APPROVED` → `VOLUNTEER_ASSIGNED` → `PICKED_UP` → `DELIVERED` → `DISTRIBUTION_COMPLETED`

---

## 6. College Project Evaluation Highlights
- **Layered Architecture:** Controller, Service, Repository, Entity pattern.
- **Race Condition Prevention:** Synchronized transaction boundaries ensure no two NGOs can claim the same batch.
- **Expiry Checking:** Rejects requests for foods whose `availableUntil` timestamp has passed.
