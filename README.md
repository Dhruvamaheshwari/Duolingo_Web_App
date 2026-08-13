# Duolingo Clone

A full-stack language learning web application.

## Tech Stack
- Frontend: Next.js, React, Tailwind CSS, TypeScript
- Backend: Django, Django REST Framework, Python
- Database: SQLite

## Setup

### Backend
```bash
cd backend
python -m venv venv
# Activate virtual environment
# Windows: .\venv\Scripts\activate
# Unix: source venv/bin/activate

pip install -r requirements.txt # (if created)
python manage.py migrate
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
