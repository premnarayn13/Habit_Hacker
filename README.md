# Habit Hacker — Productivity Intelligence & Task Execution System

[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple.svg)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green.svg)](https://supabase.com/)

Habit Hacker is a mobile-first personal productivity intelligence platform and task execution engine. It combines parent-subtask hierarchy mechanics, multi-modal task tracking (Date Ranges, Day Counts, Event Counts), measurable quantity tracking, daily execution workflows, and a read-only Master Home Dashboard.

---

## 📄 Complete Project Description

For the detailed architectural specification, task hierarchy engine rules, view breakdowns, database schema, and design system documentation, please see:

👉 **[HABIT_HACKER_COMPLETE_PROJECT_DESCRIPTION.md](./HABIT_HACKER_COMPLETE_PROJECT_DESCRIPTION.md)**

---

## 🌟 Key Product Highlights

- **Master Home Dashboard (`HomeDashboardView.jsx`)**: Central read-only productivity intelligence view with period filters, deterministic productivity score, streak heatmaps, hierarchy health, and dynamic AI insights.
- **Today Command Center (`TodayDashboard.jsx`)**: Actionable execution view for checking off daily tasks, logging measure amounts, and monitoring category progress.
- **Strict Parent-Subtask Hierarchy Engine**: Mandatory subtasks block parent completion; optional subtasks do not.
- **Dedicated Task Info Page (`TaskDedicatedPageView.jsx`)**: Double-clicking any task opens a full-screen deep inspection page.
- **Dynamic Category & 40-Icon Selector**: Create custom categories and pick icons from a palette of 40 Lucide icons.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd mobile
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
# Server running at http://localhost:3000/
```

### 3. Build for Production
```bash
npm run build
```
