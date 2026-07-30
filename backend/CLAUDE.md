# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Activate virtual environment (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run dev server
python manage.py runserver

# Run migrations
python manage.py migrate

# Seed initial data (run in this order)
python manage.py seed_documenttypes
python manage.py seed_sections
python manage.py seed_questions

# Run tests
python manage.py test

# Run tests for a single app
python manage.py test DocumentSession

# API docs (Swagger UI, while server is running)
# http://localhost:8000/api/docs/
```

## Environment

Copy `.env` from a teammate or create one with:
```
OPENROUTER_API_KEY=<your key>
```

The settings file loads it from `BASE_DIR / '.env'` via `python-dotenv`.

## Architecture

This is a Django REST Framework backend for a documentation generator. The core flow:

1. **Session creation** — A `DocumentSession` is created (UUID pk), recording which `document_type` (e.g. `"srs"`) is being generated and its lifecycle `status`.

2. **Question-driven intake** — `GET /api/document-sessions/{id}/next_section/` walks top-level `Section` objects for the session's document type in order. For each section, it recursively collects all required questions from subsections. It returns the first section that still has unanswered questions. Once a section is fully answered, it immediately fires off background AI polishing for that section before moving to the next one.

3. **Background AI generation** — `GeneratedSection/services.py:polish_section_answers` spawns a `threading.Thread` that calls OpenRouter (OpenAI-compatible API) with the section's template instructions, the style guide (`GeneratedSection/style_guide.md`), and the user's answers. SQLite requires explicit `connection.close()` at thread end to release the write lock.

4. **Document assembly** — `POST /api/document-sessions/{id}/generate/` collects all `GeneratedSection` rows with `status='ready'` in section order and concatenates their Markdown content into a `GeneratedDocument`.

### App responsibilities

| App | Role |
|---|---|
| `DocumentType` | Reference table for document types (currently only `srs`) |
| `Sections` | Hierarchical section tree per document type, each with `template_instructions` for the LLM |
| `Questions` | Questions per section, each linked to a `Section` |
| `DocumentSession` | Session tracking; hosts `next_section` and `generate` custom actions |
| `Answers` | One answer per (session, question) pair |
| `GeneratedSection` | LLM-polished content per (session, section); statuses: `pending → polishing → ready/failed` |
| `GeneratedDocument` | Final assembled Markdown document per session; statuses: `pending → assembling → ready/failed` |

### Key model relationships

```
DocumentType → Section (tree, via parent FK)
                └→ Question
DocumentSession → Answer (session + question)
DocumentSession → GeneratedSection (session + section)
DocumentSession → GeneratedDocument (OneToOne)
```

### Seeding

The `DocumentType`, `Section`, and `Question` tables are populated via management commands — not fixtures. `seed_sections.py` defines the full SRS section hierarchy with per-section `template_instructions`. `seed_questions.py` maps questions to section numbers. Run seeds after every migration on a fresh DB.

### CORS

Configured for `http://localhost:3000` (Next.js) and `http://localhost:5173` (Vite).
