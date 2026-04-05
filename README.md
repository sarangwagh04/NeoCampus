<div align="center">

# 🎓 NeoCampus
**The Intelligent, Next-Generation College Management System**

[![React](https://img.shields.io/badge/React-19-blue.svg?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7-purple.svg?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Django](https://img.shields.io/badge/Django-5-092E20.svg?style=for-the-badge&logo=django)](https://www.djangoproject.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14-316192.svg?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Gemini AI](https://img.shields.io/badge/AI-Gemini-orange.svg?style=for-the-badge&logo=google)](https://ai.google.dev/)

[Features](#-key-features) •
[Tech Stack](#-tech-stack) •
[Architecture](#%EF%B8%8F-architecture) •
[Getting Started](#-getting-started) •
[Contributing](#-contributing)

</div>

---

## 🌟 Overview

**NeoCampus** is a sophisticated, AI-enhanced College Management Platform engineered to modernize academic administration. By seamlessly bridging the gap between students, educators, and administrators, NeoCampus eliminates administrative bottlenecks and fosters a highly interactive academic environment.

Far beyond a traditional CRUD application, NeoCampus integrates **Retrieval-Augmented Generation (RAG) AI capabilities**, **dynamic data visualization**, and a **fully decoupled modern architecture** to deliver a responsive, intuitive, and secure user experience.

---

## ✨ Key Features

### 👨‍🎓 For Students
*   **Intelligent Dashboard:** Real-time overview of current attendance, latest results, and upcoming timetables.
*   **AI Academic Assistant:** An intelligent chatbot powered by Google Gemini, capable of answering syllabus questions and academic FAQs dynamically.
*   **Granular Result Tracking:** Detailed visualizations of academic performance over time.
*   **Instant Notifications:** Real-time noticeboard for important college announcements and materials.
*   **Self-Service Exports:** 1-click exports of academic records to PDF.

### 👨‍🏫 For Staff & Educators
*   **Streamlined Attendance:** Rapid, bulk attendance marking with intuitive UI.
*   **Result Management:** Effortless uploading, processing, and publishing of student grades.
*   **Performance Analytics:** Deep insights into class performance, automated stat calculation, and visual charts identifying areas of improvement.
*   **Timetable Integration:** Seamless scheduling and class management.

### 👑 System Administrators
*   **Role-Based Access Control (RBAC):** Strict JWT-based security modeling ensuring data isolation.
*   **Full System Mastery:** Complete control over user provisioning, database records, and system-wide configurations.

---

## 💻 Tech Stack

NeoCampus is built following modern industry standards, utilizing a decoupled architecture.

### Frontend 🎨
*   **Framework:** React 19 + TypeScript + Vite (Lightning-fast HMR)
*   **Styling:** Tailwind CSS + Radix UI Primitives + Framer Motion (Beautiful, accessible, and animated UI)
*   **State & Fetching:** TanStack React Query + Axios (Efficient caching and interceptor-based auth)
*   **Visualization & Utils:** Recharts (Analytics), jsPDF / SheetJS (Data Export), date-fns.

### Backend ⚙️
*   **Framework:** Python 3 + Django + Django REST Framework 
*   **Database:** PostgreSQL (Relational integrity & complex queries)
*   **Authentication:** JWT (JSON Web Tokens) with automated refresh flows.
*   **AI & ML Integration:** PyTorch, Transformers, LangChain, Google Gemini API (For the RAG chatbot pipeline).

---

## 🏗️ Architecture

NeoCampus embraces a **Modular Monolith** pattern on the backend and a **Component-Driven** architecture on the frontend.

*   **API Layer:** The Django application is strictly an API server (`/api/*`), broken down into domain-driven apps (`attendance`, `results`, `chatbot`, etc.).
*   **Client Layer:** The Vite/React application acts as a Single Page Application (SPA) consuming the REST API.
*   **Security Flow:** Stateless authentication. The backend provisions `access` and `refresh` tokens stored securely by the client, with Axios interceptors managing automated token rotation seamlessly.

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v20+)
*   Python (3.12+)
*   PostgreSQL (v14+)
*   A Google Gemini API Key (for AI features)

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/sarangwagh04/NeoCampus.git
cd NeoCampus
```

### 2️⃣ Backend Setup
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate | Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
```
**Environment Configuration (`backend/.env`):**
```ini
DB_HOST=localhost
DB_PORT=5432
DB_NAME=neocampus
DB_USER=postgres
DB_PASSWORD=your_password
GEMINI_API_KEY=your_gemini_key
SECRET_KEY=your_django_secret
```
**Run Migrations & Server:**
```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### 3️⃣ Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

The application will now be running. Navigate to `http://localhost:5173` to view the frontend, communicating with the backend at `http://localhost:8000`.

---

## 🌎 Deployment Readiness

NeoCampus is configured for rapid deployment:
*   **Production Server**: Uses `gunicorn` for robust backend serving (configured in `Procfile`).
*   **Static Assets**: Integrated with `WhiteNoise` for efficient serving of frontend builds.
*   **Automation**: `build.sh` script included for automated dependency sync and migrations.
*   **Runtime**: `runtime.txt` specifies the exact Python version for environment parity.

---

## 📊 Future Roadmap

*   [ ] **Predictive AI:** Machine learning models to predict student performance trends and identify at-risk individuals.
*   [ ] **Mobile Application:** React Native companion app for push notifications and offline mode.
*   [ ] **Cloud Native Deployment:** Containerization via Docker & Kubernetes scaling configurations.
*   [ ] **Multi-Tenant Support:** Allowing multiple distinct colleges to operate on a single deployed instance.

---

## 🤝 Contributing

We welcome contributions! Please refer to the [`NEWCOMER_GUIDE.md`](./NEWCOMER_GUIDE.md) for detailed instructions on the codebase architecture, setup best practices, and contribution workflows.

---

## 👨‍💻 Author

**Sarang Wagh**
*Computer Science & Design Engineering Student*
*Vithalrao Vikhe Patil College of Engineering, Ahilyanagar, India*

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/sarangwagh04/)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/sarangwagh04)

---

> **Note:** This project is actively developed for academic and portfolio purposes.
