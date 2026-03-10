# TunePath API (FastAPI)

MVP backend with Cloudflare R2 media URLs. Identity is ID-based; titles are display-only.

## Where things live

- **Frontend `assets/`** – App shell only: fonts, app icons, splash, favicon, and any local videos used by Metro. Do not put lesson/course media here.
- **Backend / database** – Metadata and identity: instruments, tutors, courses, lessons. Store `id`, `course_id`, `tutor_id`, `instrument`, `level`; titles and descriptions are for display. No media files.
- **R2** – All lesson and course cover media. Paths use **IDs only** (see below). Public URLs are built with `R2_PUBLIC_BASE_URL`; no proxying through the backend.

## Why IDs for storage

- Multiple tutors can have courses with the same title (e.g. "Basic Sargam"); storage and URLs must stay unique.
- Avoids encoding/slug issues and renames; `course_id` and `lesson_id` are the source of truth.

## R2 object path convention (ID-based)

- Course cover: `courses/course_{course_id}/cover/thumbnail.jpg`
- Lesson media: `courses/course_{course_id}/lessons/lesson_{lesson_id}/thumbnail.jpg`, `video.mp4`, `audio.mp3`, `notation.json`

URLs: `{R2_PUBLIC_BASE_URL}/{path}`. No proxying; clients load directly from R2.

## Run

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Endpoints

- `GET /courses/?instrument=&level=` - List courses
- `GET /courses/{id}/lessons` - Lesson list (thumbnail only)
- `GET /lessons/{id}` - Full lesson with media URLs
- `GET /health` - Health check
