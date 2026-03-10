"""
TunePath API - MVP backend.
Lesson media served via R2 direct URLs; no proxying through backend.
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.db import get_courses, get_course_progress, get_lesson_detail, get_lessons_by_course, get_recent_courses
from app.models import Course, CourseProgress, LessonDetail, LessonListItem

app = FastAPI(title="TunePath API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/courses/", response_model=list[Course])
def list_courses(instrument: str = "harmonium", level: str = "beginner"):
    return get_courses(instrument, level)


@app.get("/courses/{course_id}/lessons", response_model=list[LessonListItem])
def list_lessons(course_id: int) -> list[LessonListItem]:
    """Lightweight lesson list - id, title, order, thumbnail_url only."""
    return get_lessons_by_course(course_id)


@app.get("/lessons/{lesson_id}", response_model=LessonDetail)
def lesson_detail(lesson_id: int) -> LessonDetail:
    """Full lesson with video_url, audio_url, notation_url, thumbnail_url."""
    lesson = get_lesson_detail(lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson


@app.get("/users/me/recent-courses", response_model=list[Course])
def recent_courses():
    """Courses in progress for current user. MVP: returns empty or stub."""
    return get_recent_courses()


@app.get("/courses/{course_id}/progress", response_model=CourseProgress)
def course_progress(course_id: int):
    """Progress for course. MVP: returns stub."""
    return get_course_progress(course_id)


@app.post("/progress/")
def update_progress():
    """Update lesson progress. MVP: no-op."""
    return None


@app.post("/courses/{course_id}/restart")
def restart_course(course_id: int):
    """Restart course progress. MVP: no-op."""
    return None


@app.get("/health")
def health():
    return {"status": "ok"}
