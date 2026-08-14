# Duolingo Web App 🦉

A full-stack, responsive language learning web application inspired by Duolingo. Built with Next.js, Django REST Framework, and Tailwind CSS.

---

## 🌟 Key Features

- **Interactive Learning Path**: Responsive skill tree layout with dynamic unit headers, progress tracking, and lesson nodes.
- **Global Theme Support**: Seamless Light Mode and sleek Dark Mode powered by HSL CSS variables and persistent user preferences.
- **User Authentication**: Complete session-based authentication flow (Signup, Login, Logout, Session verification).
- **Gamification Mechanics**:
  - **Hearts System**: Manage hearts with dynamic refill and deduction capabilities.
  - **XP & Streaks**: Earn XP upon lesson completion and maintain daily streaks.
  - **Live Leaderboard**: Rank users based on total XP.
- **Three-Column Dashboard**: Fixed navigation sidebar, centered interactive main content, and right-side stats widget.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Vanilla CSS Variables
- **Icons**: Lucide React

### Backend
- **Framework**: Django 5 / 6 & Django REST Framework (DRF)
- **WSGI / Server**: Gunicorn & WhiteNoise (Static File Management)
- **Database**: SQLite3 (configurable storage path)

---

## 📁 Project Structure

```text
Duolingo_Web_App/
├── backend/                  # Django REST API Service
│   ├── backend_project/      # Core settings and WSGI configuration
│   ├── courses/              # Course, Unit, & Skill models/views/seed command
│   ├── lessons/              # Lesson exercises & completion views
│   ├── progress/             # User stats, hearts, & leaderboard
│   ├── users/                # Auth endpoints (Signup, Login, Logout, Me)
│   ├── Procfile              # Gunicorn process file
│   ├── requirements.txt      # Python dependencies
│   ├── .ebextensions/        # AWS Elastic Beanstalk deployment configs
│   └── .platform/            # Elastic Beanstalk postdeploy deployment hooks
│
└── frontend/                 # Next.js Frontend Application
    ├── src/
    │   ├── app/              # App router pages (/, /login, /signup, /profile, /leaderboard, /lesson/[id])
    │   ├── components/       # UI components (Sidebar, RightSidebar, ThemeToggle, etc.)
    │   └── lib/              # API fetch client & TypeScript interfaces
    ├── public/               # Static assets
    └── package.json          # Node dependencies
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+ and pip

---

### 1. Backend Setup (Django)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   - **Windows**:
     ```bash
     python -m venv venv
     .\venv\Scripts\activate
     ```
   - **macOS/Linux**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create environment file (`.env`):
   ```ini
   DEBUG=True
   SECRET_KEY=your-secret-key-here
   SQLITE_PATH=db.sqlite3
   ALLOWED_HOSTS=*
   CORS_ALLOWED_ORIGINS=http://localhost:3000
   ```

5. Apply migrations and seed initial course data:
   ```bash
   python manage.py migrate
   python manage.py seed
   ```

6. Start Django development server:
   ```bash
   python manage.py runserver 8000
   ```
   The backend API will run at `http://localhost:8000/api/`.

---

### 2. Frontend Setup (Next.js)

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variable (`.env.local`):
   ```ini
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```

4. Start Next.js development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## 📡 API Reference

### Authentication
- `POST /api/auth/signup/` — Register a new account
- `POST /api/auth/login/` — Authenticate existing user
- `POST /api/auth/logout/` — End active session & clear cookies
- `GET  /api/auth/me/` — Retrieve authenticated user profile

### Learning Path & Lessons
- `GET  /api/learning-path/` — Fetch courses, units, and skill nodes
- `GET  /api/lessons/<id>/` — Fetch lesson content & exercises
- `POST /api/lessons/<id>/complete/` — Complete lesson, award XP & streak

### Progress & Leaderboard
- `GET  /api/progress/` — Fetch current user XP, streak, and hearts
- `GET  /api/progress/leaderboard/` — Fetch global XP rankings
- `POST /api/progress/deduct-heart/` — Deduct 1 heart on incorrect attempt
- `POST /api/progress/refill-hearts/` — Refill hearts to maximum (5)

---

## ☁️ Deployment Guide

### Deploy Frontend to Vercel
1. Set the root directory to `frontend`.
2. Configure Environment Variable:
   - `NEXT_PUBLIC_API_URL` = `https://<your-backend-domain>/api`
3. Build Command: `npm run build`

### Deploy Backend to Render
1. Root Directory: `backend`
2. Build Command: `pip install -r requirements.txt`
3. Start Command: `gunicorn backend_project.wsgi:application`
4. Add Persistent Disk (`/var/data`, 1GB) and set `SQLITE_PATH=/var/data/db.sqlite3`.

### Deploy Backend to AWS Elastic Beanstalk
1. Uses `Procfile` (`web: gunicorn backend_project.wsgi:application`).
2. `.ebextensions/django.config` configures `WSGIPath` and static file routing.
3. `.platform/hooks/postdeploy/01_db_setup.sh` automatically executes `migrate` and `seed` post-deployment.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
