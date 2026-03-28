# SynapseCare - Cloud-Native Healthcare Platform

Welcome to the Cloud-Native Healthcare Platform! This is a comprehensive, microservices-based application built with Java Spring Boot, backed by **PostgreSQL**. It includes a beautiful, responsive frontend UI to handle interactions across patients, doctors, and administrators seamlessly.

> **⚠️ Important Update (March 2026)**: The doctor verification system has been redesigned with a robust event-driven architecture. See [Doctor Verification Architecture](docs/DOCTOR_VERIFICATION_ARCHITECTURE.md) for details.

## 🏗️ Architecture Overview

The system is designed with independent, scalable microservices communicating over standard RESTful HTTP protocols.

* **Auth Service (`:8081`)**: Manages user registration, authentication (JWT), and roles.
* **Doctor Service (`:8082`)**: Contains doctor entities, specialization details, experience tracking, and maintains a registry of availability slots.
* **Appointment Service (`:8083`)**: Acts as the central scheduling system mapping Patients to Doctors.
* **Patient Service (`:8084`)**: Manages patient profiles and medical records.
* **AI Symptom Checker Service (`:8085`)**: Providing preliminary health suggestions using AI.
* **API Gateway (`:8080`)**: Central entry point for all service requests.

## 💻 Tech Stack

* **Backend Framework**: Java Spring Boot
* **Database Engine**: PostgreSQL 15
* **Frontend UI**: Vanilla HTML5, CSS3 Variables & Glassmorphism Aesthetics
* **Containerization**: Docker & Docker Compose
* **Message Broker**: RabbitMQ
* **Orchestration**: Kubernetes (K8s)

## 📂 Project Structure

```bash
healthcare-platform/
├── admin-service/         # Admin functionalities
├── appointment-service/   # Booking & scheduling logic
├── doctor-service/        # Doctor profiles & availability
├── auth-service/          # Authentication & User management
├── api-gateway/           # Central API Gateway
├── AI-SymptomChecker-Service/ # AI integration
├── frontend/              # Rich UI interface
├── k8s/                   # Kubernetes deployment YAML scripts
├── docker-compose.yml     # Local orchestration map
└── README.md              # Documentation
```

## 🚀 Getting Started

### Option 1: Running with Docker Compose (Recommended)
This approach boots up the Microservices, RabbitMQ, and PostgreSQL.
1. Open a terminal in the root directory.
2. Run the compose command:
   ```bash
   docker-compose up --build -d
   ```
3. **Database Records**: Records are stored in the `./docker-data/postgres` folder in the root directory. This ensures they persist even if you stop the containers.

### Option 2: Running Locally
If running microservices individually, you can use a local PostgreSQL instance. Ensure the connection strings in `application.properties` point to `localhost:5432`.

## 🔐 Database Notes

* **Engine**: PostgreSQL 15 (Dockerized)
* **Credentials**: User: `postgres`, Password: `Luqa`, DB: `synapscare`.
* **Persistence**: Data is saved to the **`./docker-data/postgres`** folder.
* **Auto-DDL**: Spring Boot `hibernate.ddl-auto: update` is used to manage schema.
relies on the database name correctly executing upon boot-up, initializing all configured Entities directly into relational tables seamlessly!
