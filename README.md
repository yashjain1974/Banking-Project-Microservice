# UGDI Bank: A Microservices-Based Digital Banking Platform

![Java](https://img.shields.io/badge/java-%23ED8B00.svg?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring](https://img.shields.io/badge/spring-%236DB33F.svg?style=for-the-badge&logo=spring&logoColor=white)
![Angular](https://img.shields.io/badge/angular-%23DD0031.svg?style=for-the-badge&logo=angular&logoColor=white)
![Apache Kafka](https://img.shields.io/badge/Apache%20Kafka-000?style=for-the-badge&logo=apachekafka)
![Oracle](https://img.shields.io/badge/Oracle-F80000?style=for-the-badge&logo=oracle&logoColor=white)

## Project Overview
<img width="913" height="500" alt="image" src="https://github.com/user-attachments/assets/054c41c6-c5e8-48c1-ad1c-e598419ccbc0" />

[![Watch the video]](https://youtu.be/J4Xj_8pak50)


UGDI Bank is a modern, full-stack digital banking platform built using a microservices architecture. The project demonstrates enterprise-grade application development with high scalability, security, and resilience. It provides a comprehensive suite of banking functionalities through a distributed system of independent services.

## 🌟 Key Features

### Architecture & Design
- **Microservices Architecture**: Distributed system with independent services for user management, accounts, transactions, loans, and cards
- **Event-Driven Communication**: Apache Kafka message broker for asynchronous processing and real-time notifications
- **Service Discovery**: Eureka server for dynamic service registration and discovery
- **API Gateway**: Centralized routing and load balancing with Spring Cloud Gateway

### Security & Identity
- **Centralized Authentication**: Keycloak integration with Single Sign-On (SSO)
- **JWT-Based Authorization**: Secure token-based authentication across all microservices
- **Hybrid KYC Verification**: Admin approval workflow for customer identity verification
- **OAuth2 Security**: Spring Security with OAuth2 integration

### Resilience & Monitoring
- **Fault Tolerance**: Resilience4j with Circuit Breakers and Retry mechanisms
- **Performance Monitoring**: Prometheus metrics collection with Grafana dashboards
- **Distributed Tracing**: Zipkin for end-to-end request tracking
- **Health Checks**: Actuator endpoints for service health monitoring

### User Experience
- **Modern Frontend**: Angular-based responsive web application
- **Real-time Notifications**: Live updates for transactions and KYC status
- **Comprehensive Banking Features**: Account management, transactions, loans, and card services

## 🛠️ Technology Stack

| Category | Technologies |
|----------|-------------|
| **Backend Framework** | Spring Boot, Spring Security, Spring Cloud |
| **Frontend** | Angular, TypeScript, HTML5, CSS3 |
| **Authentication** | Keycloak, Spring Security OAuth2, JWT |
| **Messaging** | Apache Kafka, Spring Kafka |
| **Database** | Oracle Database, Spring Data JPA, Hibernate |
| **Service Discovery** | Netflix Eureka |
| **API Gateway** | Spring Cloud Gateway |
| **Resilience** | Resilience4j, Feign Client |
| **Monitoring** | Prometheus, Grafana, Zipkin |
| **Build Tools** | Maven, npm |

## 🏗️ System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Angular       │    │   API Gateway    │    │   Keycloak      │
│   Frontend      │◄──►│  (Port: 8080)    │◄──►│  (Port: 8180)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                        ┌───────┴───────┐
                        │               │
            ┌───────────▼─────┐    ┌────▼──────────┐
            │ Eureka Server   │    │   Zipkin      │
            │ (Port: 8761)    │    │ (Port: 9411)  │
            └─────────────────┘    └───────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
┌───────▼────┐  ┌──────▼──────┐  ┌─────▼─────┐
│User Service│  │Account      │  │Transaction│
│(Port: 8081)│  │Service      │  │Service    │
└────────────┘  │(Port: 8082) │  │(Port: 8083│
                └─────────────┘  └───────────┘
        │               │               │
        └───────────────┼───────────────┘
                        │
              ┌─────────▼──────────┐
              │   Apache Kafka     │
              │  (Port: 9092)      │
              └────────────────────┘
                        │
              ┌─────────▼──────────┐
              │   Oracle Database  │
              │  (Port: 1521)      │
              └────────────────────┘
```

## 📋 Prerequisites

- **Java Development Kit (JDK) 17 or higher**
- **Node.js 16+ and npm**
- **Oracle Database 19c or higher**
- **Apache Kafka 2.8+**
- **Keycloak 20+**
- **Zipkin Server**
- **Git**

## 🚀 Installation & Setup Guide

### 1. Clone the Repository

```bash
git clone https://github.com/yashjain1974/Banking-Project-Microservice.git
cd Banking-Project-Microservice
```

### 2. Database Setup

#### Oracle Database Configuration
1. Install Oracle Database and create the main database
2. Create separate schemas for each microservice:
   ```sql
   CREATE USER ugdi_user IDENTIFIED BY password;
   CREATE USER ugdi_account IDENTIFIED BY password;
   CREATE USER ugdi_transaction IDENTIFIED BY password;
   CREATE USER ugdi_loan IDENTIFIED BY password;
   CREATE USER ugdi_card IDENTIFIED BY password;
   CREATE USER ugdi_notification IDENTIFIED BY password;
   
   -- Grant necessary privileges
   GRANT CONNECT, RESOURCE, DBA TO ugdi_user;
   GRANT CONNECT, RESOURCE, DBA TO ugdi_account;
   GRANT CONNECT, RESOURCE, DBA TO ugdi_transaction;
   GRANT CONNECT, RESOURCE, DBA TO ugdi_loan;
   GRANT CONNECT, RESOURCE, DBA TO ugdi_card;
   GRANT CONNECT, RESOURCE, DBA TO ugdi_notification;
   ```

3. Update database connection properties in each microservice's `application.yml`:
   ```yaml
   spring:
     datasource:
       url: jdbc:oracle:thin:@localhost:1521:XE
       username: ugdi_user
       password: password
       driver-class-name: oracle.jdbc.OracleDriver
   ```

### 3. Keycloak Setup

#### Download and Install Keycloak
1. Download Keycloak from [official website](https://www.keycloak.org/downloads)
2. Extract and navigate to the Keycloak directory
3. Start Keycloak:
   ```bash
   # Windows
   bin\kc.bat start-dev --http-port=8180
   
   # Linux/Mac
   ./bin/kc.sh start-dev --http-port=8180
   ```

#### Configure Keycloak Realm
1. Access Keycloak Admin Console: `http://localhost:8180`
2. Create admin user (first-time setup)
3. Create a new realm named `bank-realm`
4. Create clients for each microservice:
   - **ugdi-bank-frontend** (public client for Angular)
   - **user-service** (confidential client)
   - **account-service** (confidential client)
   - **transaction-service** (confidential client)
   - **loan-service** (confidential client)
   - **card-service** (confidential client)

5. Create roles:
   - `ADMIN`
   - `CUSTOMER`
   - `MANAGER`

6. Create test users and assign appropriate roles

### 4. Apache Kafka Setup

#### Download and Install Kafka
1. Download Apache Kafka from [official website](https://kafka.apache.org/downloads)
2. Extract Kafka to your preferred directory
3. Start Zookeeper:
   ```bash
   # Windows
   bin\windows\zookeeper-server-start.bat config\zookeeper.properties
   
   # Linux/Mac
   bin/zookeeper-server-start.sh config/zookeeper.properties
   ```

4. Start Kafka Server:
   ```bash
   # Windows
   bin\windows\kafka-server-start.bat config\server.properties
   
   # Linux/Mac
   bin/kafka-server-start.sh config/server.properties
   ```

#### Create Required Topics
```bash
# Navigate to Kafka directory and run:

# Windows
bin\windows\kafka-topics.bat --create --topic user-events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
bin\windows\kafka-topics.bat --create --topic transaction-events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
bin\windows\kafka-topics.bat --create --topic notification-events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
bin\windows\kafka-topics.bat --create --topic kyc-events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1

# Linux/Mac
bin/kafka-topics.sh --create --topic user-events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
bin/kafka-topics.sh --create --topic transaction-events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
bin/kafka-topics.sh --create --topic notification-events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
bin/kafka-topics.sh --create --topic kyc-events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
```

### 5. Zipkin Setup

#### Download and Run Zipkin
1. Download Zipkin server JAR from [Zipkin releases](https://search.maven.org/remote_content?g=io.zipkin&a=zipkin-server&v=LATEST&c=exec)
2. Run Zipkin server:
   ```bash
   java -jar zipkin-server-exec.jar --server.port=9411
   ```
3. Access Zipkin UI: `http://localhost:9411`

### 6. Prometheus and Grafana Setup (Optional)

#### Prometheus Setup
1. Download Prometheus from [official website](https://prometheus.io/download/)
2. Configure `prometheus.yml`:
   ```yaml
   global:
     scrape_interval: 15s
   
   scrape_configs:
     - job_name: 'eureka-server'
       static_configs:
         - targets: ['localhost:8761']
     - job_name: 'api-gateway'
       static_configs:
         - targets: ['localhost:8080']
     - job_name: 'user-service'
       static_configs:
         - targets: ['localhost:8081']
     - job_name: 'account-service'
       static_configs:
         - targets: ['localhost:8082']
   ```
3. Start Prometheus: `./prometheus --config.file=prometheus.yml`

#### Grafana Setup
1. Download and install Grafana from [official website](https://grafana.com/grafana/download)
2. Start Grafana (default port: 3000)
3. Add Prometheus as data source
4. Import banking service dashboards

## 🔧 Running the Application

### Step 1: Start Infrastructure Services

1. **Start Keycloak** (if not already running):
   ```bash
   bin\kc.bat start-dev --http-port=8180  # Windows
   ./bin/kc.sh start-dev --http-port=8180  # Linux/Mac
   ```

2. **Start Kafka and Zookeeper** (if not already running):
   ```bash
   # Start Zookeeper first, then Kafka as shown in setup section
   ```

3. **Start Zipkin**:
   ```bash
   java -jar zipkin-server-exec.jar --server.port=9411
   ```

### Step 2: Start Backend Services

Start services in the following order:

1. **Eureka Discovery Server**:
   ```bash
   cd eureka-server
   mvn spring-boot:run
   ```
   Access at: `http://localhost:8761`

2. **API Gateway**:
   ```bash
   cd api-gateway
   mvn spring-boot:run
   ```
   Access at: `http://localhost:8080`

3. **Core Microservices** (can be started in parallel):
   
   **User Service**:
   ```bash
   cd user-service
   mvn spring-boot:run
   ```
   
   **Account Service**:
   ```bash
   cd account-service
   mvn spring-boot:run
   ```
   
   **Transaction Service**:
   ```bash
   cd transaction-service
   mvn spring-boot:run
   ```
   
   **Loan Service**:
   ```bash
   cd loan-service
   mvn spring-boot:run
   ```
   
   **Card Service**:
   ```bash
   cd card-service
   mvn spring-boot:run
   ```
   
   **Notification Service**:
   ```bash
   cd notification-service
   mvn spring-boot:run
   ```

### Step 3: Start Frontend Application

1. **Navigate to frontend directory**:
   ```bash
   cd banking-frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start Angular development server**:
   ```bash
   ng serve --open
   ```
   
   The application will open automatically in your browser at `http://localhost:4200`

## 📱 Service Endpoints

| Service | Port | Health Check | Description |
|---------|------|--------------|-------------|
| Eureka Server | 8761 | `http://localhost:8761/actuator/health` | Service Discovery |
| API Gateway | 8080 | `http://localhost:8080/actuator/health` | API Gateway |
| User Service | 8081 | `http://localhost:8081/actuator/health` | User Management |
| Account Service | 8082 | `http://localhost:8082/actuator/health` | Account Operations |
| Transaction Service | 8083 | `http://localhost:8083/actuator/health` | Transaction Processing |
| Loan Service | 8084 | `http://localhost:8084/actuator/health` | Loan Management |
| Card Service | 8085 | `http://localhost:8085/actuator/health` | Card Services |
| Notification Service | 8086 | `http://localhost:8086/actuator/health` | Notifications |
| Angular Frontend | 4200 | `http://localhost:4200` | Web Application |

## 🔍 Monitoring and Observability

- **Eureka Dashboard**: `http://localhost:8761` - Service registry and discovery
- **Zipkin Dashboard**: `http://localhost:9411` - Distributed tracing
- **Keycloak Admin**: `http://localhost:8180` - Identity and access management
- **Prometheus**: `http://localhost:9090` - Metrics collection (if configured)
- **Grafana**: `http://localhost:3000` - Metrics visualization (if configured)

## 🧪 Testing the Application

### Sample API Calls

1. **Register New User** (via API Gateway):
   ```bash
   curl -X POST http://localhost:8080/api/users/register \
   -H "Content-Type: application/json" \
   -d '{
     "username": "testuser",
     "email": "test@example.com",
     "firstName": "Test",
     "lastName": "User",
     "phoneNumber": "1234567890"
   }'
   ```

2. **Check Account Balance**:
   ```bash
   curl -X GET http://localhost:8080/api/accounts/balance/1 \
   -H "Authorization: Bearer {JWT_TOKEN}"
   ```

### Frontend Testing
1. Navigate to `http://localhost:4200`
2. Register a new user account
3. Wait for admin approval (or approve via Keycloak admin console)
4. Login and explore banking features

## 🛠️ Development

### Adding New Features

1. **Create new microservice**:
   - Follow existing service structure
   - Configure database schema
   - Register with Eureka
   - Add to API Gateway routing

2. **Frontend development**:
   - Use Angular CLI: `ng generate component feature-name`
   - Follow existing patterns for API integration
   - Implement proper error handling

### Code Style and Standards

- Follow Spring Boot best practices
- Use proper exception handling
- Implement comprehensive logging
- Write unit and integration tests
- Follow Angular style guide

## 🚨 Troubleshooting

### Common Issues

1. **Port Conflicts**:
   - Check if ports 8080, 8081-8086, 8761, 9411, 9092, 8180 are available
   - Modify port configurations in `application.yml` if needed

2. **Database Connection Issues**:
   - Verify Oracle database is running
   - Check connection URLs and credentials
   - Ensure schemas are created with proper permissions

3. **Keycloak Authentication Failures**:
   - Verify realm and client configurations
   - Check JWT token validity
   - Ensure proper role assignments

4. **Kafka Connection Issues**:
   - Verify Zookeeper is running before Kafka
   - Check topic creation
   - Verify bootstrap server configuration

5. **Service Discovery Issues**:
   - Ensure Eureka server is started first
   - Check service registration in Eureka dashboard
   - Verify network connectivity between services

### Logs and Debugging

- Check individual service logs in their respective directories
- Use Zipkin for tracing request flows
- Monitor Eureka dashboard for service health
- Check Kafka topics for message flow

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add some feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Yash Jain**
- GitHub: [@yashjain1974](https://github.com/yashjain1974)
- Project Link: [https://github.com/yashjain1974/Banking-Project-Microservice](https://github.com/yashjain1974/Banking-Project-Microservice)

## 🙏 Acknowledgments

- Spring Boot Team for excellent framework
- Angular Team for powerful frontend framework
- Apache Kafka for reliable messaging
- Keycloak for identity management
- Oracle for robust database solutions

---

For more detailed documentation, please refer to individual service README files in their respective directories.
