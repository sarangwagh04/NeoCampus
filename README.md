# 🎓 NeoCampus

NeoCampus is a modern, AI-powered College Management System designed to
streamline academic operations, improve communication, and provide
intelligent insights for students and staff.

Built with a modular architecture, NeoCampus integrates attendance
management, result analysis, announcements, AI chatbot support, and
role-based access control into one unified platform.

------------------------------------------------------------------------

## 🚀 Features

### 👨‍🎓 Student Features

-   Secure login
-   Attendance tracking
-   Academic announcements
-   Event participation
-   AI chatbot for syllabus & academic queries
-   Personal profile management

### 👨‍🏫 Staff Features

-   Mark and manage attendance
-   Upload & analyze results
-   Publish academic announcements
-   Manage timetable
-   View student performance insights

### 👑 Admin

-   Full database access
-   Manage all users
-   Delete/modify any system entry
-   Monitor activity logs
-   System-level configuration

------------------------------------------------------------------------

## 🤖 AI-Powered Capabilities

-   Academic FAQ chatbot
-   Syllabus-based Q&A support
-   Result analytics
-   Performance insights

------------------------------------------------------------------------

## 🛠️ Tech Stack

### 🔹 Frontend

-   HTML
-   CSS
-   JavaScript
-   React
-   Tailwind CSS

### 🔹 Backend

-   Django
-   Python

### 🔹 Database

-   PostgreSQL (Primary)

### 🔹 Authentication & Security

-   Password hashing
-   Role-Based Access Control (RBAC)
-   Token-based authentication

------------------------------------------------------------------------

## 🏗️ Project Architecture


------------------------------------------------------------------------

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

git clone https://github.com/YOUR_USERNAME/NeoCampus.git cd NeoCampus

### 2️⃣ Create Virtual Environment

python -m venv venv venv`\Scripts`{=tex}`\activate`{=tex}

### 3️⃣ Install Dependencies

pip install -r requirements.txt

### 4️⃣ Setup Environment Variables

Create a `.env` file:

DB_HOST=localhost\
DB_PORT=5433\
DB_NAME=neocampus\
DB_USER=postgres\
DB_PASSWORD=your_password

### 5️⃣ Run Server

If using Django:

python manage.py runserver

------------------------------------------------------------------------

## 🔐 Roles & Access Control

NeoCampus follows strict Role-Based Access Control:

-   Student → Access to personal academic features only
-   Staff → Academic management features
-   Admin (Superuser) → Full system control

> Note: Admin role is created via terminal and is not assigned manually.

------------------------------------------------------------------------

## 📊 Future Enhancements

-   AI-powered performance prediction
-   Mobile app integration
-   Advanced analytics dashboard
-   Cloud deployment
-   Multi-college support

------------------------------------------------------------------------

## 👨‍💻 Author

**Sarang Wagh**\
Computer Science & Design Engineering Student\
Vithalrao Vikhe Patil College of Engineering,
Ahilyanagar, India

------------------------------------------------------------------------

## 📜 License

This project is built for educational and academic purposes.
