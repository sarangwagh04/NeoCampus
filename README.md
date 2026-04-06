<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=30&pause=1000&color=6366F1&center=true&vCenter=true&width=600&lines=🎓+NeoCampus;Intelligent+Campus+Management;Built+for+the+Modern+University" alt="NeoCampus" />

# NeoCampus
### **The Intelligent, Full-Stack College Management Platform**

*Bridging academics, AI, and administration — all in one place.*

---

[![React](https://img.shields.io/badge/React-19-61DAFB.svg?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Django](https://img.shields.io/badge/Django-6-092E20.svg?style=for-the-badge&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-AI-orange.svg?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

[🌟 Features](#-features-in-depth) • [🏗️ Architecture](#️-system-architecture) • [💻 Tech Stack](#-tech-stack) • [🚀 Quick Start](#-quick-start) • [📸 Screenshots](#-screenshots) • [👨‍💻 Author](#-author)

</div>

---

## 🧭 Overview

**NeoCampus** is a production-grade, AI-powered college management platform engineered from the ground up to modernize academic administration. It is a **full-stack decoupled application** — a React 19 SPA frontend talking to a Django 6 REST API backend backed by PostgreSQL.

What makes NeoCampus stand out:

- 🤖 **AI-First Design** — Google Gemini powers a subject-specific chatbot (RAG pipeline) and automated result trend analysis
- 🔐 **Hardware Security** — USB hardware key authentication using RSA cryptographic signing
- 📲 **Real-time Push Notifications** — Browser-native push notifications via VAPID + WebPush
- 📊 **Rich Analytics** — Visual performance dashboards with trend charts, progress rings, and stat cards
- 🔑 **JWT Auth with Role-Based Access** — Strict Student / Staff / Admin role isolation
- 📄 **PDF Generation** — One-click marksheet downloads with jsPDF + AutoTable
- 🌙 **Dark / Light Mode** — System-aware theming with smooth transitions

---

## ✨ Features In-Depth

### 🔐 Authentication & Security
- JWT-based login with **access + refresh token rotation**
- Axios interceptors for **transparent token refresh** — no user interruption
- **Role-Based Access Control (RBAC)** — Students and Staff see completely different interfaces
- **Hardware USB Key Authentication** — RSA private/public key cryptographic challenge between the server and a registered USB device, enabling seamless auto-login on key insertion
- Protected routes enforced on both frontend and backend

---

### 📊 Student Dashboard
- Real-time overview card showing **attendance percentage**, **result summary**, and **upcoming classes**
- **Progress Ring** showing attendance health at a glance
- **Quick Access** shortcuts to most-used features
- **Today's Schedule** pulled dynamically from the timetable
- **Recent Materials** — latest study resources from enrolled subjects

---

### 📅 Attendance Management
- Subject-wise attendance breakdown with percentage and status badges
- **Overall Attendance Card** — total present/absent/total classes
- Visual color coding: safe / at-risk / defaulter thresholds
- Staff can mark **bulk attendance** for entire classes efficiently

---

### 📝 Results & Analytics
- Full **subject-wise mark breakdown** per semester
- **Performance Trend Chart** — multi-semester SPI/GPA plotted over time using Recharts
- **Backlogs Section** — clearly highlights pending subjects
- **Results Summary Cards** — GPA, total marks, pass/fail at a glance
- **One-click PDF Marksheet** generation with student info and marks table (jsPDF + AutoTable)
- **Excel/CSV export** of result data (SheetJS/xlsx)

---

### 🤖 AI Chatbot (Gemini RAG)
- Subject-specific AI assistant powered by **Google Gemini API**
- Students select a subject and ask academic questions
- Context-aware responses grounded in syllabus content
- Clean chat UI with message history, typing indicators, and empty states

---

### 📊 AI Result Analysis (Staff)
- Staff upload CSV result files
- **Gemini AI analyzes** the data: identifies weak topics, class performance trends, at-risk students
- Generates structured natural-language insights automatically
- Reduces hours of manual analysis to seconds

---

### 🔔 Push Notifications (Web Push)
- Browser-native **Web Push Notifications** using **VAPID keys + pywebpush**
- Students subscribe and receive real-time alerts for:
  - New notice board posts
  - Material uploads
  - Result publications
- `PushNotificationManager` component handles subscription lifecycle

---

### 📚 Study Materials
- Staff upload and tag materials per subject
- Students browse and filter materials by subject, type, or date
- Supports **file attachments** and **reference links**
- Clean card-based UI with metadata (type, subject, date)

---

### 🗓️ Timetable
- Staff create and manage weekly timetables
- Students view their complete weekly schedule in a clean grid layout
- Dynamic day/period rendering

---

### 👤 Profile Management
- **Personal Info** — Name, contact, photo
- **Academic Info** — Branch, semester, enrollment number
- **Guardian Info** — Parent/guardian contact details
- **Hardware Key Manager** — Register, view, and revoke USB authentication keys
- **Change Password** — Secure in-app password update
- **System Info** — Account type, last login, browser info

---

### 🏛️ Staff Panel
- **Attendance Panel** — Mark, view, and edit attendance for any class/subject
- **Materials Panel** — Upload materials with subject tags and file types
- **Results Panel** — Upload and publish student results in bulk
- **Timetable Manager** — Create and edit class schedules
- **AI Analysis** — Upload result CSVs for Gemini-powered insights
- **Profile Settings** — Staff-specific profile management

---

### 🌐 Notice Board
- Admin/Staff post important notices
- Students receive **instant push notifications**
- Notices archived and browsable with timestamps

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────┐
│                  CLIENT BROWSER                  │
│  React 19 SPA (Vite + TypeScript + Tailwind)     │
│  TanStack Query · Axios · React Router v7        │
│  Framer Motion · Recharts · jsPDF                │
└────────────────────┬────────────────────────────┘
                     │ HTTPS REST API (JSON)
                     │ JWT Bearer Token Auth
┌────────────────────▼────────────────────────────┐
│              DJANGO 6 BACKEND (DRF)              │
│  ┌─────────┐ ┌─────────┐ ┌────────────────────┐ │
│  │accounts │ │ results │ │     chatbot (RAG)  │ │
│  ├─────────┤ ├─────────┤ ├────────────────────┤ │
│  │profiles │ │attend.  │ │  resultanalysis    │ │
│  ├─────────┤ ├─────────┤ ├────────────────────┤ │
│  │timetable│ │noticbrd │ │  home / USB auth   │ │
│  └─────────┘ └─────────┘ └────────────────────┘ │
│  SimpleJWT · WhiteNoise · Gunicorn               │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│              PostgreSQL Database                 │
│       Relational · ACID · Complex Queries        │
└─────────────────────────────────────────────────┘
                     │
        ┌────────────▼──────────────┐
        │     External Services     │
        │  Google Gemini API (AI)   │
        │  VAPID Web Push Service   │
        │  USB Hardware Key (RSA)   │
        └───────────────────────────┘
```

**Key Architecture Decisions:**
- **Decoupled SPA + REST API** — Frontend and backend are fully independent; can be deployed separately
- **Stateless Auth** — JWT tokens; backend holds no session state, scales horizontally
- **Domain-Driven Django Apps** — Each feature is a self-contained app (`attendance`, `results`, `chatbot`, etc.)
- **Axios Interceptors** — Transparent token refresh without interrupting user experience
- **TanStack Query** — Server state caching, background refetching, optimistic updates

---

## 💻 Tech Stack

### Frontend

| Category | Technology | Why |
|---|---|---|
| Framework | React 19 + TypeScript | Type-safe, modern concurrent rendering |
| Build Tool | Vite 7 | Sub-second HMR, lightning-fast builds |
| Styling | Tailwind CSS 3 | Utility-first, consistent design system |
| UI Primitives | Radix UI | Accessible, unstyled component base |
| Animations | Framer Motion | Smooth, physics-based micro-animations |
| State/Fetching | TanStack React Query | Smart caching, background sync |
| HTTP | Axios | Interceptor-based auth, centralized config |
| Routing | React Router v7 | File-based SPA routing |
| Charts | Recharts | Composable SVG charts |
| PDF | jsPDF + AutoTable | Client-side PDF marksheet generation |
| Auth | jwt-decode + SimpleJWT | Stateless session management |
| Notifications | Sonner | Toast notification system |
| Theme | next-themes | Dark/light mode with system awareness |

### Backend

| Category | Technology | Why |
|---|---|---|
| Framework | Django 6 | Batteries-included, secure, production-proven |
| API | Django REST Framework | Serializers, ViewSets, filtering |
| Auth | SimpleJWT | Stateless JWT with refresh rotation |
| Database | PostgreSQL + psycopg3 | ACID compliance, complex joins |
| AI | Google Gemini API | State-of-the-art LLM for chatbot + analysis |
| ML | sentence-transformers, torch | Embeddings for RAG pipeline |
| PDF | PyMuPDF, pdfplumber | Server-side PDF parsing for result uploads |
| Push | py-vapid + pywebpush | Standards-compliant Web Push Protocol |
| Crypto | cryptography (RSA) | USB hardware key signature verification |
| Data | Pandas, scikit-learn | CSV result processing and analysis |
| Static | WhiteNoise | Zero-config static file serving |
| Server | Gunicorn | Production WSGI server |
| Admin | Django Jazzmin | Beautiful admin panel UI |

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18 & npm ≥ 9
- Python 3.12+
- PostgreSQL running locally

### 1️⃣ Clone
```bash
git clone https://github.com/sarangwagh04/NeoCampus.git
cd NeoCampus
```

### 2️⃣ Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Linux/macOS

pip install -r requirements.txt
cp .env.example .env           # Fill in your values
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```
> 📖 See [`backend/README.md`](./backend/README.md) for detailed backend setup & env variable guide.

### 3️⃣ Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
> 📖 See [`frontend/README.md`](./frontend/README.md) for full frontend documentation.

### 4️⃣ Access
| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000/api/ |
| Admin Panel | http://localhost:8000/admin/ |

---

## 📁 Repository Structure

```
NeoCampus/
├── backend/                  # Django REST API
│   ├── accounts/             # Auth, JWT, users
│   ├── attendance/           # Attendance tracking
│   ├── chatbot/              # Gemini AI chatbot (RAG)
│   ├── home/                 # Dashboard, USB auth, push
│   ├── noticeboard/          # Campus notices
│   ├── profiles/             # Student & staff profiles
│   ├── resultanalysis/       # AI result analysis
│   ├── results/              # Marks and grades
│   ├── timetables/           # Weekly schedules
│   ├── neocampus/            # Settings, URLs, WSGI
│   ├── requirements.txt
│   ├── runtime.txt
│   ├── Procfile
│   └── .env.example
│
├── frontend/                 # React 19 SPA
│   ├── src/
│   │   ├── api/              # Axios instance
│   │   ├── components/       # UI components by feature
│   │   ├── pages/            # Route-level pages
│   │   ├── hooks/            # Custom React hooks
│   │   └── utils/            # Auth, logout helpers
│   └── package.json
│
├── NEWCOMER_GUIDE.md         # Contributor onboarding guide
└── README.md
```

---

## 🌐 Deployment

Ready for production on Render, Heroku, or any Linux VPS:

| File | Purpose |
|---|---|
| `Procfile` | `web: gunicorn neocampus.wsgi` |
| `build.sh` | Installs deps, runs `collectstatic` + `migrate` |
| `runtime.txt` | Pins Python `3.12.10` for environment parity |
| `WhiteNoise` | Serves static files without a separate web server |

---

## 📊 Roadmap

- [x] JWT Authentication + RBAC
- [x] Student & Staff Dashboards
- [x] Attendance Management
- [x] Result Tracking + PDF Export
- [x] AI Chatbot (Gemini RAG)
- [x] AI Result Analysis
- [x] Web Push Notifications
- [x] USB Hardware Key Authentication
- [x] Dark/Light Mode
- [ ] Predictive ML — At-risk student early warnings
- [ ] Mobile App — React Native companion
- [ ] Docker + CI/CD Pipeline
- [ ] Multi-tenant support (multiple colleges)

---

## 🤝 Contributing

Contributions are welcome! See [`NEWCOMER_GUIDE.md`](./NEWCOMER_GUIDE.md) for codebase walkthrough, architecture notes, and contribution workflow.

---

## 👨‍💻 Author

<div align="center">

**Sarang Wagh**
*B.E. Computer Science & Design Engineering*
*Vithalrao Vikhe Patil College of Engineering, Ahilyanagar, India*

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/sarangwagh04/)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/sarangwagh04)

---

> *Built with ❤️ as a full-stack portfolio project demonstrating real-world engineering — AI integration, hardware security, push notifications, and production-ready architecture.*

</div>
