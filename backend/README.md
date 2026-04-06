# NeoCampus — Backend

A robust, production-ready REST API backend built with **Django 6 + Django REST Framework**, powering the NeoCampus college management portal.

---

## 🚀 Tech Stack

| Category | Technology |
|---|---|
| Framework | Django 6.0 |
| API | Django REST Framework 3.16 |
| Auth | JWT (SimpleJWT) |
| Database | PostgreSQL (via psycopg3) |
| AI | Google Gemini API |
| Push Notifications | WebPush (py-vapid + pywebpush) |
| PDF Processing | PyMuPDF, pdfplumber, pdf2image |
| Data Analysis | Pandas, scikit-learn |
| ML / Embeddings | sentence-transformers, transformers, torch |
| Static Files | WhiteNoise |
| Task Server | Gunicorn |
| Admin UI | Django Jazzmin |

---

## ✨ Django Apps

| App | Purpose |
|---|---|
| `accounts` | User registration, login, JWT auth, role management |
| `home` | Dashboard data, USB hardware key listener, push notifications |
| `profiles` | Student & staff profile management |
| `attendance` | Subject-wise attendance tracking |
| `results` | Semester results, marks, backlogs |
| `resultanalysis` | AI-powered result trend analysis using Gemini |
| `chatbot` | Subject-specific AI chatbot using Gemini |
| `noticeboard` | Campus notices with push notification support |
| `timetables` | Weekly class timetable management |
| `neocampus` | Core project settings, URL config, WSGI/ASGI |

---

## 🛠️ Getting Started

### Prerequisites
- Python 3.12+
- PostgreSQL installed and running
- A virtual environment tool (`venv`)

### 1. Clone & Navigate

```bash
cd backend
```

### 2. Create & Activate Virtual Environment

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux / macOS
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

```bash
# Copy the example env file
cp .env.example .env

# Edit .env and fill in your values
```

See [`.env.example`](.env.example) for what each variable does and how to get it.

### 5. Set Up the Database

```bash
# Make sure PostgreSQL is running and you've created the DB:
# psql -U postgres -c "CREATE DATABASE neocampus;"

python manage.py migrate
```

### 6. Create a Superuser (Admin)

```bash
python manage.py createsuperuser
```

### 7. Run the Development Server

```bash
python manage.py runserver
```

API will be available at **http://localhost:8000**
Admin panel at **http://localhost:8000/admin**

---

## 📁 Project Structure

```
backend/
├── accounts/          # Auth, user models, JWT
├── attendance/        # Attendance tracking
├── chatbot/           # Gemini AI chatbot
├── home/              # Dashboard, USB listener, push notifications
├── noticeboard/       # Campus notices
├── profiles/          # Student & staff profiles
├── resultanalysis/    # AI result analysis
├── results/           # Student results & marks
├── timetables/        # Timetable management
├── neocampus/         # Settings, URLs, WSGI, ASGI
├── static/            # Static assets (source)
├── templates/         # Django HTML templates
├── manage.py          # Django CLI
├── requirements.txt   # Python dependencies
├── runtime.txt        # Python version (for Heroku/Render)
├── Procfile           # Deployment process config
├── build.sh           # Build script for deployment
└── .env.example       # Environment variable template
```

---

## 🔑 Environment Variables

All required variables are documented in [`.env.example`](.env.example).

| Variable | Description |
|---|---|
| `SECRET_KEY` | Django secret key |
| `DEBUG` | `True` for dev, `False` for production |
| `DB_*` | PostgreSQL connection settings |
| `GEMINI_API_KEY` | Gemini API key for chatbot |
| `GEMINI_API_KEY2` | Gemini API key for result analysis |
| `VAPID_PRIVATE_KEY` | Web push notification private key |
| `VAPID_PUBLIC_KEY` | Web push notification public key |

---

## 🌐 Deployment

The backend is configured for deployment on **Render / Heroku**:

- `Procfile` — defines the web process (`gunicorn neocampus.wsgi`)
- `build.sh` — installs deps, runs `collectstatic` and `migrate`
- `runtime.txt` — pins Python version to `3.12.10`

---

## 🔗 Frontend

This backend serves the **React + TypeScript** frontend.

👉 See [`/frontend/README.md`](../frontend/README.md) for frontend setup instructions.
