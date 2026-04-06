# NeoCampus — Frontend

A modern, feature-rich campus management portal built with **React 19 + TypeScript + Vite**.
Designed for students and staff to manage attendance, results, materials, timetables, and more — all in one place.

---

## 🚀 Tech Stack

| Category | Technology |
|---|---|
| Framework | React 19 |
| Language | TypeScript |
| Build Tool | Vite 7 |
| Styling | Tailwind CSS v3 |
| UI Components | Radix UI + shadcn/ui |
| Animations | Framer Motion |
| State / Fetching | TanStack React Query |
| Routing | React Router v7 |
| Charts | Recharts |
| HTTP Client | Axios |
| Auth | JWT (jwt-decode) |
| PDF Export | jsPDF + jsPDF-AutoTable |
| Notifications | Sonner |

---

## ✨ Features

- 🔐 **Authentication** — JWT-based login with role-based access (Student / Staff)
- 📊 **Dashboard** — Attendance overview, today's schedule, quick access cards
- 📅 **Attendance** — Subject-wise attendance tracking with visual indicators
- 📝 **Results** — Semester results, performance trend charts, backlog tracking, PDF marksheet download
- 📚 **Materials** — Subject-wise study material access with file attachments
- 🗓️ **Timetable** — Weekly class schedule view
- 🤖 **AI Chatbot** — Subject-specific AI assistant powered by Gemini
- 🔔 **Push Notifications** — Web push notifications for notices
- 👤 **Profile** — Personal, academic, guardian info + hardware key (USB) management
- 🌙 **Dark/Light Mode** — System-aware theme toggle
- 📊 **Staff Panel** — Result analysis, attendance management, material uploads (staff only)

---

## 🛠️ Getting Started

### Prerequisites
- Node.js >= 18
- npm >= 9
- Backend running at `http://localhost:8000` (see `/backend/README.md`)

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at **http://localhost:5173**

---

## 📁 Project Structure

```
frontend/src/
├── api/                  # Axios instance and API config
├── components/
│   ├── attendance/       # Attendance cards and tables
│   ├── auth/             # Protected routes, push notification manager
│   ├── chatbot/          # AI chatbot UI components
│   ├── dashboard/        # Dashboard layout, sidebar, stat cards
│   ├── landing/          # Landing page sections
│   ├── materials/        # Study materials UI
│   ├── profile/          # Profile sections (personal, academic, hardware key)
│   ├── results/          # Result charts, tables, PDF download
│   ├── staff/            # Staff-only panels (analysis, attendance, materials)
│   ├── timetable/        # Timetable view
│   └── ui/               # Reusable shadcn/ui base components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions (cn, etc.)
├── pages/                # Page-level route components
├── utils/                # Helpers (auth, logout, etc.)
├── App.tsx               # Root app with routing
└── main.tsx              # Entry point
```

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

---

## 🔗 Backend

This frontend communicates with the **Django REST Framework** backend.
Make sure the backend is running before starting the frontend.

👉 See [`/backend/README.md`](../backend/README.md) for backend setup instructions.
