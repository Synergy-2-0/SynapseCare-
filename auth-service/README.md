# UserService Microservice

A production-ready Spring Boot microservice for comprehensive user management, authentication, and authorization in a telemedicine ecosystem. Provides role-based access control (RBAC), JWT-based authentication, and multi-user type support (patients, doctors, admins).

## 🎯 Features

- **Multi-Role User Management**: Support for PATIENT, DOCTOR, and ADMIN roles
- **JWT Authentication**: Token-based authentication with refresh token rotation
- **Doctor Verification Workflow**: Admin can verify/approve doctor registrations
- **Soft Delete**: Logical deletion with data preservation
- **Password Encryption**: BCrypt-based password hashing
- **User Status Management**: Support for active/inactive and verified/unverified states
- **Role-Based Access Control**: Spring Security with method-level authorization
- **Clean REST API**: Well-structured endpoints for auth, user, and admin operations
- **Error Handling**: Centralized exception handling with meaningful HTTP status codes
- **Postman Collection**: Ready-to-use API testing collection with environment variables

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Java** | 21 | Programming language |
| **Spring Boot** | 4.0.4 | Framework |
| **Spring Security** | 7.x | Authentication & Authorization |
| **Spring Data JPA** | 7.x | ORM & Database access |
| **PostgreSQL** | 15+ | Primary database |
| **JWT (jjwt)** | 0.12.3 | Token management |
| **Lombok** | 1.18.30 | Boilerplate reduction |
| **Docker & Compose** | Latest | Containerization |
| **Maven** | 3.9+ | Build tool |

---

## 📋 Prerequisites

- **Java 21** or higher
- **Maven 3.9+**
- **PostgreSQL 15+** or Docker
- **Postman** (for API testing, optional)
- **Git**

---

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd org
```

### 2. Configure Database

#### Option A: Docker (Recommended)
```bash
docker-compose up -d
```
This starts PostgreSQL on `localhost:5432` with:
- Database: `user_service_db`
- User: `postgres`
- Password: `postgres`

#### Option B: Existing PostgreSQL
Update `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/user_service_db
spring.datasource.username=<your-username>
spring.datasource.password=<your-password>
```

### 3. Build & Run

#### Using Maven Wrapper
```bash
# Build
./mvnw clean package

# Run
./mvnw spring-boot:run
```

#### Using System Maven
```bash
mvn clean package
java -jar target/UserManagementApplication-0.0.1-SNAPSHOT.jar
```

The service starts on **http://localhost:8080**

### 4. Verify Service
```bash
curl http://localhost:8080/api/auth/register/patient
# Should return 400 (missing request body, which means service is running)
```

---

## 📱 API Endpoints

### Authentication (`/api/auth`)

#### Register Patient
```http
POST /api/auth/register/patient
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890"
}
```
**Response**: `201 Created` with JWT tokens and user details

#### Register Doctor
```http
POST /api/auth/register/doctor
Content-Type: application/json

{
  "username": "dr_smith",
  "email": "dr.smith@example.com",
  "password": "DocPass123!",
  "firstName": "Smith",
  "lastName": "Davis",
  "phoneNumber": "+1234567890"
}
```
**Response**: `201 Created` (doctor pending verification)

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```
**Response**: `200 OK` with accessToken, refreshToken, and user details
**Note**: Doctors must be verified by admin before login succeeds

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```
**Response**: `200 OK` with new accessToken

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer your-access-token
```
**Response**: `200 OK`

---

### User (`/api/users`)

#### Get My Profile
```http
GET /api/users/me
Authorization: Bearer your-access-token
```
**Response**: `200 OK` with user details

#### Update My Profile
```http
PUT /api/users/me
Authorization: Bearer your-access-token
Content-Type: application/json

{
  "firstName": "John Updated",
  "lastName": "Doe",
  "phoneNumber": "+0987654321"
}
```
**Response**: `200 OK` with updated user

#### Change Password
```http
PUT /api/users/me/password
Authorization: Bearer your-access-token
Content-Type: application/json

{
  "currentPassword": "SecurePass123!",
  "newPassword": "NewPass456!"
}
```
**Response**: `200 OK`

#### List Verified Doctors
```http
GET /api/users/doctors
Authorization: Bearer your-access-token
```
**Response**: `200 OK` with list of verified doctors

#### Get Doctor By ID
```http
GET /api/users/doctors/{doctorId}
Authorization: Bearer your-access-token
```
**Response**: `200 OK` with doctor details

---

### Admin (`/api/admin`)

#### List All Users
```http
GET /api/admin/users
Authorization: Bearer admin-access-token
```
**Response**: `200 OK` with all users (excludes deleted, excludes admins)

#### List Users By Role
```http
GET /api/admin/users/role/DOCTOR
Authorization: Bearer admin-access-token
```
**Response**: `200 OK` with users of specified role

#### List Pending Doctors
```http
GET /api/admin/doctors/pending
Authorization: Bearer admin-access-token
```
**Response**: `200 OK` with unverified doctors

#### Verify Doctor
```http
PUT /api/admin/doctors/{doctorId}/verify
Authorization: Bearer admin-access-token
```
**Response**: `200 OK` with verified doctor

#### Toggle User Status
```http
PUT /api/admin/users/{userId}/toggle-status
Authorization: Bearer admin-access-token
```
**Response**: `200 OK` with updated user

#### Delete User (Soft Delete)
```http
DELETE /api/admin/users/{userId}
Authorization: Bearer admin-access-token
```
**Response**: `200 OK` (user marked as deleted, not removed from DB)

---

## 🧪 Testing with Postman

### Import Collection
1. Open Postman
2. Click **Import** → Choose `postman/UserService.postman_collection.json`
3. Import the environment from `postman/UserService.postman_environment.json`

### Set Up Variables
Before running requests, configure in Postman environment:
- `baseUrl`: `http://localhost:8080`
- `patientEmail`, `patientPassword`: Patient credentials
- `doctorEmail`, `doctorPassword`: Doctor credentials
- `adminEmail`, `adminPassword`: Pre-existing admin credentials
- Other profile fields as needed

### Run Tests
1. Select the environment from top-right dropdown
2. Navigate to collection folders: Auth → Register → Login → etc.
3. Click **Send** on each request
4. Tests validate response status and auto-extract tokens to environment

---

## 🗄️ Database Setup

### Initialize Database
```bash
# Using Docker Compose
docker-compose up -d
```

### Manual PostgreSQL Setup
```sql
-- Create database
CREATE DATABASE user_service_db;

-- Connect and run migrations (auto-applied via Hibernate JPA)
psql -U postgres -d user_service_db
```

### Default Schema
Hibernate automatically creates/updates tables from JPA entities:
- **users**: Main user table with roles, status, timestamps
- **refresh_tokens**: Token storage for session management

### Database Cleanup (if needed)
```sql
-- View users
SELECT id, email, role, is_active, is_verified, is_deleted FROM users;

-- Set all users as non-deleted (if migrating)
UPDATE users SET is_deleted = false WHERE is_deleted IS NULL;

-- Add default constraints
ALTER TABLE users ALTER COLUMN is_active SET DEFAULT true;
ALTER TABLE users ALTER COLUMN is_verified SET DEFAULT false;
ALTER TABLE users ALTER COLUMN is_deleted SET DEFAULT false;
```

---

## ⚙️ Configuration

### application.properties
```properties
# Server
server.port=8080
server.servlet.context-path=/
spring.application.name=UserService

# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/user_service_db
spring.datasource.username=postgres
spring.datasource.password=postgres
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# JWT
jwt.secret=your-super-secret-jwt-key-change-in-production-at-least-32-chars
jwt.expiration=3600000
jwt.refresh_expiration=604800000

# Logging
logging.level.root=INFO
logging.level.com.synapscare.org=DEBUG
```

### Environment Variables
```bash
# Production override example
export DATABASE_URL=postgresql://user:pass@db-host:5432/user_service_db
export JWT_SECRET=your-production-secret-key
export JWT_EXPIRATION=3600000
```

---

## 🐳 Docker Deployment

### Build Image
```bash
docker build -t user-service:latest .
```

### Run Container
```bash
docker run -d \
  --name user-service \
  -p 8080:8080 \
  --network compose_default \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/user_service_db \
  -e SPRING_DATASOURCE_USERNAME=postgres \
  -e SPRING_DATASOURCE_PASSWORD=postgres \
  user-service:latest
```

### Using Docker Compose
```bash
docker-compose up -d
```
Services: `userservice` (port 8080) + `postgres` (port 5432)

---

## 📊 Project Structure

```
org/
├── src/main/java/com/synapscare/org/
│   ├── UserManagementApplication.java      # Entry point
│   ├── config/
│   │   └── SecurityConfig.java             # Spring Security setup
│   ├── controller/
│   │   ├── AuthController.java             # Auth endpoints
│   │   ├── UserController.java             # User endpoints
│   │   └── AdminController.java            # Admin endpoints
│   ├── service/
│   │   ├── AuthService.java                # Auth business logic
│   │   └── UserService.java                # User business logic
│   ├── repository/
│   │   ├── UserRepository.java             # User data access
│   │   └── RefreshTokenRepository.java     # Token data access
│   ├── entity/
│   │   ├── User.java                       # User JPA entity
│   │   └── RefreshToken.java               # Token JPA entity
│   ├── dto/
│   │   ├── request/                        # Request DTOs
│   │   └── response/                       # Response DTOs
│   ├── security/
│   │   ├── JwtUtils.java                   # JWT utilities
│   │   ├── JwtConfig.java                  # JWT configuration
│   │   ├── JwtAuthenticationFilter.java    # JWT filter
│   │   └── UserDetailsImpl.java             # User details impl
│   └── exception/
│       ├── Exceptions.java                 # Custom exceptions
│       └── GlobalExceptionHandler.java     # Exception handling
├── src/main/resources/
│   ├── application.properties               # Configuration
│   └── static/                              # Static files
├── postman/
│   ├── UserService.postman_collection.json # API tests
│   └── UserService.postman_environment.json # Test variables
├── pom.xml                                  # Maven dependencies
├── compose.yaml                             # Docker Compose config
├── mvnw, mvnw.cmd                          # Maven wrapper
└── README.md                                # This file
```

---

## 🔐 Security Notes

### JWT Configuration
- **Access Token**: Expires in 1 hour (default)
- **Refresh Token**: Expires in 7 days (default)
- Change `jwt.secret` in production to a strong, random string (min 32 chars)

### Password Policy
- Passwords are encrypted using BCrypt
- Minimum length enforced via DTOs
- No plaintext passwords logged or stored

### CORS (if needed)
Configure in `SecurityConfig.java`:
```java
http.cors(cors -> cors.configurationSource(request -> {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(List.of("http://localhost:3000"));
    return config;
}));
```

### Rate Limiting
Not implemented by default. Consider adding via Spring Cloud or custom interceptors.

---

## 🚨 Error Handling

All errors return consistent JSON format:
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Doctor account is pending verification",
  "timestamp": "2026-03-22T16:46:35.015315"
}
```

### Common Status Codes
| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request / Invalid input |
| 401 | Unauthorized / Invalid credentials |
| 403 | Forbidden / Insufficient permissions |
| 404 | Not Found |
| 409 | Conflict / Duplicate email/username |
| 500 | Internal Server Error |

---

## 🧑‍💻 For Developers

### Adding a New Endpoint

1. **Create DTO** (`dto/request/` or `dto/response/`)
2. **Add Service Method** (`service/*.java`)
3. **Add Repository Query** if needed (`repository/*.java`)
4. **Create Controller Endpoint** (`controller/*.java`)
5. **Test via Postman** and add to collection

### Key Annotations
- `@RestController`: Mark as REST endpoint handler
- `@PostMapping`, `@GetMapping`, `@PutMapping`, `@DeleteMapping`: HTTP methods
- `@Valid`: Validate request payloads
- `@AuthenticationPrincipal`: Inject current user
- `@Transactional`: Database transaction management

### Common Patterns
```java
// Validate unique email
if (userRepository.existsByEmail(email)) {
    throw new DuplicateResourceException("Email already in use");
}

// Find user with soft-delete check
User user = userRepository.findByIdAndIsDeletedFalse(id)
    .orElseThrow(() -> new ResourceNotFoundException("User not found"));

// Check role-based access
if (user.getRole() != User.Role.ADMIN) {
    throw new UnauthorizedAccessException("Admin access required");
}
```

---

## 🐛 Troubleshooting

### Service won't start
- Check PostgreSQL is running: `docker-compose ps`
- Verify `application.properties` database URL
- Check Java 21 installed: `java -version`

### 401 Unauthorized on login
- Confirm user exists: check database
- **For doctors**: Ensure verified by admin first
- Confirm password matches (case-sensitive)

### 500 Internal Server Error
- Check server logs: `docker-compose logs userservice`
- Verify all required fields in request body
- Ensure JWT secret is set in properties

### Token expired
- Use refresh endpoint with `refreshToken` to get new `accessToken`
- Refresh tokens valid for 7 days by default

---

## 📚 Additional Resources

- [Spring Boot Docs](https://spring.io/projects/spring-boot)
- [Spring Security Docs](https://spring.io/projects/spring-security)
- [JWT Documentation](https://jwt.io)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Postman Collection Format](https://learning.postman.com/docs/getting-started/introduction/)

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make changes and test locally
3. Commit with clear messages: `git commit -m "feat: add feature"`
4. Push to branch: `git push origin feature/my-feature`
5. Create pull request

### Testing Before Submit
```bash
# Run all tests
./mvnw test

# Build and verify
./mvnw clean package

# Test with Postman collection
# Import and run all requests
```

---

## 📄 License

[Your License Here - e.g., MIT, Apache 2.0]

---

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact the development team
- Refer to API documentation in Postman collection

---

**Last Updated**: March 22, 2026  
**Version**: 1.0.0  
**Status**: Production Ready
