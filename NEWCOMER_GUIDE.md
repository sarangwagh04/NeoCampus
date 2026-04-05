# 🚀 NeoCampus: Developer & Newcomer Guide

Welcome to the NeoCampus engineering team! This guide is designed to get you up and running quickly, providing insights into our architectural choices, development patterns, and best practices.

## 🏗️ High-Level Architecture

NeoCampus is a decoupled full-stack application:
- **Backend (`/backend`)**: A RESTful API built with Python, Django, and Django REST Framework (DRF).
- **Frontend (`/frontend`)**: A modern Single Page Application (SPA) built with React 19, TypeScript, and Vite.

Communication happens exclusively via REST over HTTP, secured by JWT (JSON Web Tokens).

---

## 💻 Frontend Ecosystem (`/frontend`)

The frontend is built for performance and maintainability.

### Key Technologies
- **Vite & SWC**: Lightning-fast builds and Hot Module Replacement (HMR).
- **TypeScript**: Strict static typing to catch errors at compile time.
- **Tailwind CSS & Radix UI**: Highly customizable utility-first styling paired with unstyled, accessible UI primitives. 
- **TanStack React Query**: Server-state management, caching, and synchronization.
- **Framer Motion**: Smooth, physics-based animations.

### Directory Structure
```text
src/
├── api/        # Axios instances and interceptor configurations
├── components/ # Reusable UI pieces (Buttons, Cards) & domain components
├── hooks/      # Custom React hooks (often wrapping React Query)
├── pages/      # Route-level components (Dashboard, Results, etc.)
├── utils/      # Pure functions, formatters, and export helpers (jsPDF)
├── App.tsx     # Application root with global providers (Toaster, Themes)
└── main.tsx    # React entrypoint
```

### Request/Response Flow (Frontend)
1. **Login**: User submits credentials; backend returns `access` and `refresh` tokens.
2. **Storage**: Tokens are saved locally.
3. **Interceptors**: `src/api/axios.ts` attaches `Authorization: Bearer <token>` to every outbound request.
4. **Token Rotation**: If a request fails with `401 Unauthorized`, the Axios interceptor automatically pauses the queue, uses the `refresh` token to get a new `access` token, and replays the failed requests transparently.

---

## ⚙️ Backend Ecosystem (`/backend`)

The backend follows a Modular Monolith approach, utilizing Django's "app" structure.

### Key Technologies
- **Django & DRF**: Robust ORM, admin panel, and rapid API endpoint creation.
- **PostgreSQL**: Primary relational data store.
- **Simple JWT**: Handles standard JWT provisioning and validation.
- **PyTorch / Transformers / Google Gemini**: Powers the AI chatbot capabilities.

### Application Modules
Django models data based on specific domains (`apps`):
- `home`: Authentication layer, user management, and high-level dashboard metrics.
- `profiles`: Granular user data (Student vs. Staff profiles).
- `attendance`: Models for Teaching Plans, Subject tracking, and Session attendance.
- `results` & `resultanalysis`: Result uploading, storage, and statistical breakdown endpoints.
- `timetables`: Daily schedule management APIs.
- `noticeboard`: Core announcement mechanics.
- `chatbot`: RAG (Retrieval-Augmented Generation) pipeline interacting with vector data and LLMs.

---

## 🧠 Important Newcomer Gotchas

*   **API Routing**: Django app endpoints are aggregated in `backend/neocampus/urls.py`. Routes are typically prefixed (e.g., `/api/attendance/`, `/api/profiles/`), but always check individual `urls.py` in the app directory to be sure.
*   **Environment Variables**: The system relies heavily on `.env` configuration. Ensure you have your `GEMINI_API_KEY` and DB credentials properly set up, or features like the Chatbot will fail or degrade gracefully.
*   **Hardcoded Origins**: During local development, CORS config and Axios base URLs might point to `localhost:8000` / `localhost:5173`. We plan to move these entirely to `.env` files for production parity.

---

## 📝 Daily Workflow & Best Practices

### 1. Adding a New API Endpoint
1. Go to the relevant Django app (e.g., `attendance`).
2. Add necessary models in `models.py` & run `makemigrations` + `migrate`.
3. Create a serializer in `serializers.py` to map Model instances to JSON.
4. Add an `APIView` or `ViewSet` in `views.py`. Protect it heavily using `IsAuthenticated` and custom role checks (e.g., `IsStaff`).
5. Route it in `urls.py`.

### 2. Adding a Frontend Feature
1. **API Hook**: Create a custom hook in `src/hooks/` combining `axios` and TanStack's `useQuery`/`useMutation` to fetch the data.
2. **Component/Page**: Create the view in `src/pages/` or `src/components/`, ensuring it's fully typed with TypeScript.
3. **Routing**: Add the page to `src/App.tsx`. Protect the route using contextual guards (`ProtectedRoute`, `RoleGuard`) if required.

## 🎓 Recommended First Steps

1. **Get it running**: Boot up both servers. Log in to the Django Admin (`/admin`), and verify basic DB operations.
2. **Trace a Request**: Open the network tab. Trigger an attendance fetch on the frontend, watch the API call, and trace it through the backend `views.py`.
3. **Understand the Auth Flow**: Study `src/api/axios.ts` to understand how the refresh token intercepts work—it's the core of the app's connectivity.
4. **Explore the AI**: Look closely at `chatbot/views.py` to see how we integrate text embeddings and Gemini generation.

Happy coding! 🚀
