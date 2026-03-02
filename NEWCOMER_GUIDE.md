# NeoCampus Newcomer Guide

## High-level architecture

NeoCampus is split into two main applications:

- `backend/`: Django + Django REST Framework API server.
- `frontend/`: React + TypeScript + Vite web application.

The frontend consumes the backend's `/api/*` endpoints and uses JWT access + refresh tokens for authentication.

## Backend structure (`backend/`)

Core project setup:
- `manage.py`: Django management entrypoint.
- `neocampus/settings.py`: app registration, JWT config, PostgreSQL config, CORS/media/static setup.
- `neocampus/urls.py`: main API URL routing.

Feature apps (each follows Django app conventions with `models.py`, `views.py`, `serializers.py`, `urls.py`):
- `home`: authentication and dashboard APIs.
- `profiles`: student/staff profile data.
- `attendance`: subject assignment, teaching plans, attendance marking and reports.
- `results`: result upload/publish plus student result views.
- `resultanalysis`: result analysis endpoint and helpers.
- `timetables`: student/staff timetable endpoints.
- `noticeboard`: notices/materials APIs.
- `chatbot`: RAG-style chatbot and staff college updates.

Media uploads are stored under `backend/media/`.

## Frontend structure (`frontend/`)

App shell and providers:
- `src/main.tsx`: React entrypoint.
- `src/App.tsx`: all routes + global providers (theme, query client, toaster, tooltip).

Organization approach:
- `src/pages/`: route-level page components.
- `src/components/`: reusable UI and feature components (auth, dashboard, attendance, chatbot, etc.).
- `src/hooks/`: API/data hooks used by pages and components.
- `src/api/axios.ts`: shared Axios instance with JWT attachment + refresh token flow.
- `src/utils/`: helper utilities (PDF/report generation, logout helpers).

Build system:
- Vite + SWC React plugin.
- `@` alias points to `src/`.

## Request/response flow

1. User logs in from the frontend login page.
2. Backend issues JWT tokens (`access` + `refresh`).
3. Frontend stores tokens in `localStorage`.
4. Axios interceptor adds `Authorization: Bearer <access_token>` on requests.
5. On `401`, Axios tries refresh endpoint and retries original request.

## Important newcomer gotchas

- API route prefixes are not fully uniform (`/api/home/...`, `/api/attendance/...`, plus some apps included at `/api/`). Always verify endpoint paths in each app's `urls.py`.
- Frontend Axios currently uses hardcoded backend origin (`http://127.0.0.1:8000`) in `src/api/axios.ts`; review this before deployment.
- Backend expects env vars (DB credentials, `SECRET_KEY`, JWT-related settings, Gemini key for chatbot).
- Chatbot depends on Google Gemini key and document chunk/embedding data in DB; without setup, chatbot features may fail.

## Practical onboarding plan

1. Run backend first, verify `/admin/` and a few API endpoints.
2. Run frontend and validate login + one student flow (dashboard/attendance).
3. Read one full vertical slice end-to-end (example: `results` app backend + `useStudentResults` hook + `Results.tsx`).
4. Learn data model relations in `profiles`, `attendance`, `results` first; these drive most features.
5. Add logging/tests around one endpoint before major refactors.

## Suggested “learn next” topics

- Django REST Framework patterns used in this codebase (APIView, serializers, permissions).
- JWT lifecycle and frontend token refresh behavior.
- Attendance + results domain models and how they feed dashboard stats.
- Chatbot retrieval pipeline (`pdf_chunker`, embeddings, similarity search, Gemini answer generation).
- Frontend route guards (`ProtectedRoute`, `RoleGuard`) and role-specific navigation.

