# Atmos Deployment Guide: Running in Production

This guide outlines the steps to deploy the Atmos platform, separating the React frontend and the Spring Boot backend.

## 1. Frontend Deployment (Vercel)

Vercel is the recommended platform for hosting the React frontend due to its speed and ease of integration.

### Prerequisites
- Your repository must be public or you must grant Vercel access to your GitHub.
- Ensure [package.json](file:///d:/Users/as/Desktop/Final_Project/Atmos_Frontend/package.json) in `Atmos_Frontend` has the correct build scripts.

### Steps
1. **Connect Repository**: Log in to [Vercel](https://vercel.com) and click **"Add New" > "Project"**.
2. **Import**: Select your GitHub repository.
3. **Configure Project**:
   - **Root Directory**: Select `Atmos_Frontend`.
   - **Framework Preset**: Vite (or React if you used create-react-app).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist` (default for Vite).
4. **Environment Variables**:
   - Add `VITE_API_BASE_URL` with the URL of your **deployed** backend (e.g., `https://atmos-api.onrender.com/api`).
5. **Deploy**: Click **"Deploy"**. Vercel will provide a URL (e.g., `atmos.vercel.app`).

---

## 2. Backend Deployment (Render / Railway / fly.io)

Since Vercel is for frontend/serverless, a persistent Java application requires a platform like Render or Railway.

### Option A: Render (Recommended for Free Tier)
1. **Create Web Service**: Connect your GitHub repo.
2. **Root Directory**: `Atmos_Backend`.
3. **Runtime**: `Docker` (e.g., via a `Dockerfile`) OR `Native` (Maven).
4. **Build Command**: `./mvnw clean package -DskipTests`
5. **Start Command**: `java -jar target/atmos-0.0.1-SNAPSHOT.jar`
6. **Environment Variables**:
   - `SPRING_DATASOURCE_URL`: Your production database URL.
   - `SPRING_PROFILES_ACTIVE`: `prod`

### Option B: Railway
1. **New Project**: Connect GitHub.
2. **Variables**: Add `PORT` (8080 or as assigned). Railway usually auto-detects Maven.

---

## 3. Database (PostgreSQL / MySQL)

For production, do not use H2. Use a managed service:
- **Neon.tech** (PostgreSQL - highly recommended)
- **Railway Database** (MySQL/PostgreSQL)
- **Aiven.io**

Update your `application-prod.properties` or environment variables to point to the production database:
```properties
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USER}
spring.datasource.password=${DB_PASS}
spring.jpa.hibernate.ddl-auto=update
```

---

## 4. Final Verification
1. Ensure the **CORS** configuration in [SecurityConfig.java](file:///d:/Users/as/Desktop/Final_Project/Atmos_Backend/src/main/java/com/itvedant/atmos/config/SecurityConfig.java) includes your Vercel URL:
   ```java
   config.setAllowedOrigins(List.of("https://your-app.vercel.app"));
   ```
2. Update the frontend [api.js](file:///d:/Users/as/Desktop/Final_Project/Atmos_Frontend/src/services/api.js) to use the production backend URL if not using environment variables.

> [!IMPORTANT]
> Always use Environment Variables for sensitive data like DB credentials or secret keys. Never commit them to version control.
