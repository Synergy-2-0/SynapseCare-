SynapseCare - Step-by-Step Deployment Guide
=========================================================

This document outlines the exact, step-by-step instructions to deploy the final deliverables (Backend Microservices, Next.js Client, and K8s Infrastructure) onto a local environment for grading.

[PREREQUISITES]
1. Install Docker Desktop and enable "Kubernetes" in the settings.
2. Install JDK 21 and Apache Maven.
3. Install Node.js (v18+) and npm.
4. Ensure ports 8080 (Gateway), 3000 (Frontend), and 5432-5440 (Databases) are free.

---
OPTION A: AUTOMATED DEPLOYMENT (Recommended)
---
For convenience, we have engineered an automated deployment script.
1. Open PowerShell as Administrator.
2. Navigate to the project root directory: `cd SynapseCare-`
3. Execute the script: `.\deploy-k8s.ps1`
   (This will automatically compile all Java binaries, build Docker images, and apply the Kubernetes manifests sequentially).

---
OPTION B: FULL MANUAL DEPLOYMENT (Step-by-Step)
---
If you prefer to deploy the system components manually, follow these chronological steps:

STEP 1: Deploy Infrastructure and Persistent Databases
------------------------------------------------------
The system requires a strict Database-per-service model and RabbitMQ Message Broker.
1. Open a terminal in the root directory.
2. Execute: `kubectl apply -f k8s/healthcare-platform.yaml`
3. Wait until all PostgreSQL instances, RabbitMQ, and MinIO pods are in the 'Running' state. You can check this by running: `kubectl get pods -A`

STEP 2: Compile Java Backend Services
-------------------------------------
You must compile the Spring Boot applications into optimized `.jar` binaries.
1. Use a terminal to navigate into EACH of the 10 service directories (e.g., `cd auth-service`).
2. Run the Maven clean install command skipping tests for speed:
   `mvn clean install -DskipTests`
3. Repeat this process for: appointment-service, doctor-service, patient-service, payment-service, prescription-service, telemedicine-service, notification-service, ai-symptom-checker-service, and api-gateway.

STEP 3: Build Docker Images locally
-----------------------------------
We must containerize the compiled binaries into the local Docker registry so Kubernetes can find them.
1. Inside each service directory, run the Docker build command matching the YAML tag. Example for Auth Service:
   `docker build -t localhost:5000/healthcare-platform-auth-service:latest .`
2. Repeat for all other 9 microservices.

STEP 4: Deploy Kubernetes Compute Pods
---------------------------------------
With the images built, orchestrate the pods.
1. Re-apply the deployment descriptor to map the newly built images:
   `kubectl apply -f k8s/healthcare-platform.yaml`
2. Wait 3 minutes for Spring Boot to fully warm up and bind to the Postgres instances.
   Verify readiness: `kubectl get pods -A`

STEP 5: Deploy the Next.js Client (Frontend)
--------------------------------------------
Finally, boot the user interface.
1. Open a new terminal and navigate to the frontend directory:
   `cd frontend`
2. Install Node dependencies:
   `npm install`
3. Start the Next.js development server:
   `npm run dev`

---
[SYSTEM ACCESS URLs]
1. Next.js Web Client: http://localhost:3000
2. API Gateway Routing: http://localhost:8080
3. To view raw database tables locally, run `.\forward-dbs.ps1` and connect via pgAdmin to localhost ports 5433-5440 (User: postgres, Pass: postgres).
