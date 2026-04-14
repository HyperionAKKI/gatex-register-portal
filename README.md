# GateX Registration Portal

This repository contains the complete full-stack architecture for a digital GateX Registration Portal with real-time UI facial alignment detection.

## Architecture Let-Down
- **Frontend**: React, Vite, Tailwind CSS, shadcn/ui, face-api.js
- **Backend**: Spring Boot 3, Java 17, Spring Data JPA
- **Database**: PostgreSQL
- **Storage**: Cloudinary

---

## 1. Local Development Setup

### Database
1. Make sure PostgreSQL is running locally (`port 5432`).
2. Create a database named `student_db` (or `gatex_db`).
3. Spring Boot will automatically manage schema generation during local testing running due to `spring.jpa.hibernate.ddl-auto=update`, or you can run `database/schema.sql` manually.

### Backend Setup (Spring Boot)
1. `cd backend`
2. Update `src/main/resources/application.properties` with your localized values and Cloudinary keys:
   ```properties
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_key
   CLOUDINARY_API_SECRET=your_secret
   ```
3. Run using Maven:
   ```bash
   mvn spring-boot:run
   ```
   The backend will be live at `http://localhost:8080`.

### Frontend Setup (React/Vite)
1. `cd frontend`
2. Install dependencies: `npm install`
3. Configure your API endpoint if needed via a `.env` file (defaults to `http://localhost:8080/api`):
   ```env
   VITE_API_URL=http://localhost:8080/api
   ```
4. Run dev server:
   ```bash
   npm run dev
   ```

---

## 2. Production Deployment Guide

### A. Database (Supabase)
1. Create a project at [Supabase.com](https://supabase.com).
2. Go to the SQL Editor and execute the script found in `database/schema.sql`.
3. Copy your explicit Connection String (JDBC or standard Postgre String) from Database Settings.

### B. Backend Deployment (Render.com)
1. Push this repository to GitHub.
2. Sign in to [Render](https://render.com) and create a **New Web Service**.
3. Connect the repository, set the Root Directory to `backend/`.
4. Environment: `Java`
5. Build Command: `mvn clean package -DskipTests`
6. Start Command: `java -jar target/student-registration-backend-0.0.1-SNAPSHOT.jar`
7. In the Render Environment Variables tab, inject the required secrets:
    - `DB_URL` = (Your Supabase JDBC string, jdbc:postgresql://...)
    - `DB_USER` = (Supabase Username)
    - `DB_PASSWORD` = (Supabase password)
    - `CLOUDINARY_CLOUD_NAME` = (...)
    - `CLOUDINARY_API_KEY` = (...)
    - `CLOUDINARY_API_SECRET` = (...)

### C. Frontend Deployment (Vercel)
1. Go to [Vercel](https://vercel.com) and Import your Github repository.
2. Set Root Directory to `frontend/`.
3. Framework Preset: **Vite**
4. Set Environment Variable:
    - `VITE_API_URL` = (The public https URL of your deployed Render service, e.g., `https://your-app.onrender.com/api`)
5. Click **Deploy**.

## Conclusion
Your portal is now robustly deployed and ready for real-world usage!
