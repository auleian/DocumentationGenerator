# Documentation Generator
An technical documentation tool built to generate documentations and other system specifications.

The platform structures engineering inputs into clean, standardized Markdown adhering strictly to **Google's Technical Writing Guidelines** and **IEEE standards** ensuring active voice, RFC 2119 requirement phrasing (`MUST`, `SHOULD`, `MAY`), and consistent team-wide standards.

---

## Project Architecture

This monorepo consists of two main services:

```text
doc-generator/
├── backend/    # Django REST Framework & SQLite engine 
└── frontend/   # Next.js App Router & TypeScript interface 
```

---

# Project setup
## Prerequisites

Ensure you have the following installed before starting:
- **Python** `3.10+`
- **Node.js** `18.0+` and `npm` 
- **Git**

## 1. Clone the Repository

Open your terminal and clone the project:

```bash
git clone [https://github.com/auleian/DocumentationGenerator.git](https://github.com/auleian/DocumentationGenerator.git)
cd DocumentationGenerator
```

## 2. Frontend setup
```bash
cd frontend
npm install
```

## 3. Backend setup
```bash
cd backend
```

**Windows**
```bash
python -m venv venv
venv\script\activate
pip install -r requirements.txt
```

**Macos\Linux**
```bash
python3 -m venv venv
source venv/bin/activate
```

## 4. Initialize SQLite Database & Run Migrations
```bash
python manage.py makemigrations core
python manage.py migrate
```
