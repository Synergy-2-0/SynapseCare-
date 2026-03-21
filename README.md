# SynapseCare - Cloud-Native Healthcare Platform

Welcome to the Cloud-Native Healthcare Platform! This is a comprehensive, microservices-based application built with Java Spring Boot, backed by Microsoft SQL Server. It includes a beautiful, responsive frontend UI to handle interactions across patients, doctors, and administrators seamlessly.

## 🏗️ Architecture Overview

The system is designed with independent, scalable microservices communicating over standard RESTful HTTP protocols.

* **Patient Service (`:8081`)**: Manages patient profiles, medical history, and securely handles medical reports and personal records.
* **Doctor Service (`:8082`)**: Contains doctor entities, specialization details, experience tracking, and maintains a registry of availability slots.
* **Appointment Service (`:8083`)**: Acts as the central scheduling system mapping Patients to Doctors. Handles bookings, cancellations, and prevents overlapping double-bookings.
* **Integration Service (`:8084`)**: The hub for external interfaces containing Payment entities, an AI Symptom Checker Chatbot endpoint, automated EMail Notifications, and Telemedicine (video-call) links.
* **Admin Service (`:8085`)**: Optional secure gateway for high-level administration to manage users, verify newly registered doctors, and view system transactions.

## 💻 Tech Stack

* **Backend Framework**: Java Spring Boot (Spring Web, Spring Data JPA, Lombok, Validation)
* **Database Engine**: Microsoft SQL Server Management (mcr.microsoft.com/mssql/server:2022-latest)
* **Frontend UI**: Vanilla HTML5, CSS3 Variables & Glassmorphism Aesthetics, JavaScript (ES6)
* **Containerization**: Docker & Docker Compose
* **Orchestration**: Kubernetes (K8s)
* **Build Tool**: Maven

## 📂 Project Structure

```bash
healthcare-platform/
├── admin-service/         # Admin functionalities
├── appointment-service/   # Booking & scheduling logic
├── doctor-service/        # Doctor profiles & availability
├── frontend/              # Rich UI interface (HTML/CSS/JS)
│   ├── css/               # Premium styling & animations
│   ├── js/                # Client-side logic & API integration
│   ├── index.html         # Landing page
│   ├── login.html         # Auth mockup
│   ├── dashboard.html     # Main Hub
│   ├── appointments.html  # Appointment management
│   ├── telemedicine.html  # Video call UI prototype
│   └── ai-chat.html       # Automated symptom checker logic
├── integration-service/   # Payments, AI Chat, Telemedicine, Email
├── patient-service/       # Patient records & data
├── k8s/                   # Kubernetes deployment YAML scripts
├── docker-compose.yml     # Local orchestration map
├── pom.xml                # Parent Maven project file
└── README.md              # Documentation
```

## 🚀 Getting Started

### Prerequisites
* Java 17+
* Maven 3.8+
* Docker Desktop (for Containerized Setup)
* Minikube or external K8s cluster (for Kubernetes Setup)

### Option 1: Running with Docker Compose (Recommended)
This approach boots up Microsoft SQL Server along with every Microservice attached.
1. Open up a terminal in the root directory: `cd healthcare-platform`
2. Run the compose command:
   ```bash
   docker-compose up --build -d
   ```
3. Docker will pull MS SQL Server, execute the health check (`sqlcmd`), and boot each microservice locally.

### Option 2: Running Locally with Maven
If you prefer running the IDE debugger or building incrementally without Docker.
1. Start an instance of Microsoft SQL Server (either locally on your machine or via a quick docker command).
2. For each microservice (`patient-service`, `doctor-service`, etc.):
   ```bash
   cd [service-name]
   mvn spring-boot:run
   ```

### Option 3: Kubernetes Deployment
The `k8s/deployments.yaml` contains configurations linking the SQL Server deployment along with `LoadBalancer` services connecting your pods. 
To apply to a K8s cluster:
```bash
kubectl apply -f k8s/deployments.yaml
```

## 🎨 Accessing the Frontend UI

Since the frontend is built natively utilizing HTML/CSS/JS without Node.js tooling:
1. Navigate directly to `healthcare-platform/frontend/`.
2. Double click the `index.html` file to open it in Chrome, Edge, Safari, or Firefox.
3. Use the interface to **Register** (as a Patient or Doctor) and **Log In** to experience the dynamic Role-based Dashboard.
4. Interact with the **Appointments**, **Telemedicine**, and **AI Symptom Chat** dashboards!

## 🔐 Database Notes

* **Engine**: SQL Server runs on port `1433`.
* **Credentials**: The `sa` user is configured using `StrongPass!123` via `ACCEPT_EULA=Y` within environmental configurations.
* **Auto-DDL**: Spring Boot `ddl-auto: update` relies on the database name correctly executing upon boot-up, initializing all configured Entities directly into relational tables seamlessly!
