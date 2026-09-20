# ⚡ Habit Hacker — Personal Productivity & Discipline Intelligence System

<div align="center">

![Habit Hacker Banner](project/mobile/public/HabitHackerImage.png)

### *Master Your Habits. Conquer Your Goals. Track Your Execution.*

[![Live Demo](https://img.shields.io/badge/🚀_Live_App-habit--hacker--kohl.vercel.app-ff0055?style=for-the-badge&logo=vercel)](https://habit-hacker-kohl.vercel.app/)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2-6DB33F?style=for-the-badge&logo=springboot)](https://spring.io/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-5A0FC8?style=for-the-badge&logo=pwa)](https://habit-hacker-kohl.vercel.app/)

---

### 🌐 **Live Web Application**: [https://habit-hacker-kohl.vercel.app/](https://habit-hacker-kohl.vercel.app/)

</div>

---

## 📌 1. Project Objective & Vision

**Habit Hacker** is an end-to-end, mobile-first personal productivity intelligence system engineered to transform human intention into daily execution. Traditional habit trackers treat all goals as binary checkboxes. Habit Hacker introduces a **hybrid multi-modal execution model**, strict **parent-subtask dependency hierarchies**, **quantitative goal tracking**, and **deterministic productivity analytics**.

### 🎯 Key Objectives:
- **Solve Goal Fragmentation**: Unify scheduled tasks, habit streaks, event frequencies, and measurable targets under a single unified tracking engine.
- **Enforce Execution Discipline**: Utilize parent-subtask completion blocking rules to prevent false progress reporting.
- **Cross-Device Account Persistence**: Ensure seamless user authentication and data access across any web browser, phone, or desktop device.
- **Actionable Productivity Analytics**: Provide a read-only Master Dashboard featuring streak heatmaps, score velocity calculations, and category heat distribution.

---

## 📸 2. System Architecture & Infographic

```
                               ┌──────────────────────────────────────────────┐
                               │             USER DEVICE / CLIENT             │
                               │  (PWA Mobile / Web / Desktop Application)    │
                               └──────────────────────┬───────────────────────┘
                                                      │
                                           HTTPS / REST API Calls
                                                      │
                                                      ▼
                              ┌────────────────────────────────────────────────┐
                              │            SPRING BOOT BACKEND API             │
                              │           (Port 8080 / Production)             │
                              │                                                │
                              │  • Custom Auth Controller (SHA-256 Hashing)    │
                              │  • Security Filter & CORS Policy Manager       │
                              │  • AI / Groq LLM Productivity Assistant        │
                              └───────────────────────┬────────────────────────┘
                                                      │
                                            Direct REST Sync
                                                      │
                                                      ▼
                              ┌────────────────────────────────────────────────┐
                              │           SUPABASE POSTGRES DATABASE           │
                              │                                                │
                              │  • app_users      (Encrypted Accounts)         │
                              │  • habits         (Habits & Parent Tasks)      │
                              │  • sub_habits     (Hierarchy Dependencies)     │
                              │  • habit_logs     (Execution History)          │
                              │  • diary_entries  (Personal Journaling)        │
                              │  • user_settings  (Preferences & Theme)        │
                              └────────────────────────────────────────────────┘
```

---

## ✨ 3. Core Features & Capabilities

### 🛠️ A. Multi-Modal Task Tracking Engine
Supports 3 distinct task execution models tailored for any habit or goal:

| Task Model | Description | Example |
| :--- | :--- | :--- |
| 📅 **Date Range Tasks** | Bound by explicit start and end dates with real-time deadline indicator badges. | *Project Sprint (Sep 1 - Sep 30)* |
| 🔄 **Day Count Tasks** | Goal-oriented habits defined by target active day counts. | *30-Day Fitness Challenge* |
| 🎯 **Event Count Tasks** | Frequency-driven tasks requiring a target total completion count. | *Attend 15 Workshops* |

---

### 🌳 B. Strict Parent-Subtask Hierarchy Engine
- **Mandatory Subtasks**: If a task has mandatory subtasks, the parent task is **locked** and cannot be completed until all mandatory subtasks are finished.
- **Optional Subtasks**: Provide incremental progress bonus without blocking parent completion.
- **Visual Completion Badges**: Displays exact subtask counts (e.g., `2/3 Subtasks Done`) on task cards.

---

### 📊 C. Master Home Dashboard & Productivity Scoring
A comprehensive, read-only analytics center featuring:
- **Deterministic Productivity Score ($0 - 100$)**: Calculated dynamically using active streak length, task completion ratio, and subtask completion volume.
- **Yearly Streak Contribution Heatmap**: Visual GitHub-style execution grid tracking daily discipline.
- **Category Heat Breakdown**: Radar & progress visualizations across custom categories (e.g., *Health, Learning, Work, Finance*).
- **Streak Counters & Best Records**: Current consecutive active streak vs. historical best record.

---

### ⚡ D. Today Command Center
- **Daily Check-Off Hub**: One-tap completion for today's active habits and subtasks.
- **Quantitative Progress Logs**: Enter numeric values for measurable habits (e.g., *Water: 2.5L / 3L*, *Reading: 20 / 30 pages*).
- **Category Filters**: Instant filtering by task status (*All, Pending, Completed*) or custom category tags.

---

### 🔒 E. Cross-Device Database Authentication
- Custom user authentication powered by Spring Boot backend.
- **SHA-256 Salted Encryption** for password security.
- **`user_id = email` Mapping**: Data automatically syncs to your account across all browsers, smartphones, tablets, and laptops.
- Zero email verification rate limits or forced OAuth redirects.

---

### 📖 F. Integrated Daily Journal & Reflections
- Record daily thoughts, wins, and reflections directly tied to your user account.
- Calendar-based journal history search and review.

---

### 📱 G. Progressive Web App (PWA) Support
- Fully installable on **Android**, **iOS (iPhone/iPad)**, **Windows**, and **macOS**.
- Features high-resolution adaptive app icons (`HabitHackerImage.png`), offline service worker caching, and full-screen standalone execution.

---

## 📂 4. Repository Structure

```
HabitHacker/
├── README.md                          # Main Comprehensive Documentation
├── project/
│   ├── backend/                       # Spring Boot Java REST Backend
│   │   ├── src/main/java/com/habithacker/
│   │   │   ├── controller/            # REST API Controllers (Auth, Habits, AI)
│   │   │   ├── model/                 # JPA Entities & Data Models
│   │   │   └── repository/            # Database Repositories
│   │   └── src/main/resources/
│   │       └── application.yml        # Spring Environment Configuration
│   │
│   ├── mobile/                        # React + Vite Frontend Web/PWA App
│   │   ├── public/                    # PWA Icons, Manifest & Static Assets
│   │   ├── src/
│   │   │   ├── components/            # UI Views (HomeDashboard, TodayView, Auth)
│   │   │   ├── lib/                   # Supabase Client & Local Database Setup
│   │   │   └── App.jsx                # Main React App Entrypoint
│   │   ├── index.html                 # HTML Template & PWA Tags
│   │   └── vite.config.js             # Vite & PWA Plugin Configuration
│   │
│   └── sql/                           # Database Schemas & Setup Scripts
│       ├── 08_USER_PROFILE_AND_SYSTEM_SETTINGS_SCHEMA.sql
│       ├── 09_SUPABASE_AUTH_SETUP.sql # app_users Schema & RLS Setup
│       └── 10_TRUNCATE_ALL_TABLES.sql # Data Maintenance Script
```

---

## 💻 5. Local Setup & Installation Guide

### Prerequisites
- **Node.js** (v18.x or higher) & **npm**
- **Java JDK** (v17 or higher)
- **Maven** (v3.8 or higher)

---

### Step 1: Clone Repository
```bash
git clone https://github.com/premnarayn13/Habit_Hacker.git
cd Habit_Hacker
```

---

### Step 2: Database Setup (Supabase)
Run the setup SQL scripts in your Supabase SQL Editor:
1. Execute `project/sql/09_SUPABASE_AUTH_SETUP.sql` to create the `app_users` table.

---

### Step 3: Run Spring Boot Backend
```bash
cd project/backend
mvn spring-boot:run
```
The backend server will start at `http://localhost:8080`.

---

### Step 4: Run React Frontend
```bash
cd ../mobile
npm install
npm run dev
```
Open your browser and navigate to `http://localhost:3000` (or `http://localhost:3001`).

---

## 🌐 6. Deployment Details

| Component | Platform | Deployment URL |
| :--- | :--- | :--- |
| **Frontend Web/PWA** | Vercel | 🔗 [https://habit-hacker-kohl.vercel.app/](https://habit-hacker-kohl.vercel.app/) |
| **Backend REST API** | Render / Spring | `https://<backend-domain>.onrender.com` |
| **Database** | Supabase | PostgreSQL Database Instance |

---

## 📱 7. How to Install Habit Hacker as an App

### **Android (Chrome / Edge)**
1. Open [https://habit-hacker-kohl.vercel.app/](https://habit-hacker-kohl.vercel.app/) in Chrome.
2. Tap the **3-dots menu (`⋮`)**.
3. Select **"Install app"** or **"Add to Home screen"**.

### **iPhone / iPad (Safari)**
1. Open [https://habit-hacker-kohl.vercel.app/](https://habit-hacker-kohl.vercel.app/) in Safari.
2. Tap the **Share icon** (box with arrow pointing up).
3. Tap **"Add to Home Screen"**.

### **Desktop (Windows / Mac)**
1. Open the live URL in Chrome or Microsoft Edge.
2. Click the **Install** icon in the address bar at the top right.

---

<div align="center">

### Built with ❤️ for Ultimate Personal Discipline

</div>
