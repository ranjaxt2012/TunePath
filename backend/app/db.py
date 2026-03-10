"""
In-memory seed data. Identity is ID-based; storage paths use IDs only.
Replace with DB later.
"""
from app.models import Course, LessonDetail, LessonListItem, LessonSection
from app.r2 import (
    course_thumbnail_url,
    lesson_audio_url,
    lesson_notation_url,
    lesson_thumbnail_url,
    lesson_video_url,
)

# Tutors (id is source of truth; name is display-only)
TUTORS = [
    {"id": 1, "name": "Priya Sharma"},
    {"id": 2, "name": "Ravi Kumar"},
]

# Courses: instrument_id/slug, level, tutor_id. Titles can duplicate across tutors.
COURSES = [
    {
        "id": 1,
        "title": "Basic Sargam",
        "description": "Intro to sargam",
        "instrument": "harmonium",
        "level": "beginner",
        "tutor_id": 1,
    },
    {
        "id": 2,
        "title": "Basic Sargam",
        "description": "Sargam fundamentals with a different approach",
        "instrument": "harmonium",
        "level": "beginner",
        "tutor_id": 2,
    },
    {
        "id": 3,
        "title": "Raag Yaman",
        "description": "Introduction to Raag Yaman",
        "instrument": "harmonium",
        "level": "intermediate",
        "tutor_id": 1,
    },
    {
        "id": 4,
        "title": "Scales for Beginners",
        "description": "Piano scales",
        "instrument": "piano",
        "level": "beginner",
        "tutor_id": 2,
    },
]

LESSONS = [
    {"id": 1, "course_id": 1, "title": "Straight Scale", "description": "Sa to Sa", "order": 1, "sections": [{"start": 0, "end": 12, "notation": "Sa Re Ga Ma Pa Dha Ni Sa"}, {"start": 13, "end": 24, "notation": "Sa Ni Dha Pa Ma Ga Re Sa"}]},
    {"id": 2, "course_id": 1, "title": "Double Notes", "description": "Paired notes", "order": 2, "sections": [{"start": 0, "end": 15, "notation": "Sa Sa Re Re Ga Ga Ma Ma Pa Pa Dha Dha Ni Ni Sa Sa"}]},
    {"id": 3, "course_id": 2, "title": "Scale Basics", "description": "Tutor 2 approach", "order": 1, "sections": [{"start": 0, "end": 10, "notation": "Sa Re Ga Ma Pa Dha Ni Sa"}]},
    {"id": 4, "course_id": 3, "title": "Yaman Aroha", "description": "Ascending", "order": 1, "sections": []},
    {"id": 5, "course_id": 4, "title": "C Major Scale", "description": "Piano", "order": 1, "sections": []},
]


def _tutor_name(tutor_id: int) -> str:
    for t in TUTORS:
        if t["id"] == tutor_id:
            return t["name"]
    return ""


def get_courses(instrument: str, level: str) -> list[Course]:
    out = []
    for c in COURSES:
        if c["instrument"] != instrument or c["level"] != level:
            continue
        out.append(
            Course(
                id=c["id"],
                title=c["title"],
                description=c.get("description"),
                instrument=c["instrument"],
                level=c["level"],
                tutor_name=_tutor_name(c["tutor_id"]),
                thumbnail_url=course_thumbnail_url(c["id"]),
            )
        )
    return out


def get_lessons_by_course(course_id: int) -> list[LessonListItem]:
    items = [rec for rec in LESSONS if rec["course_id"] == course_id]
    return [
        LessonListItem(
            id=rec["id"],
            course_id=rec["course_id"],
            title=rec["title"],
            lesson_order=rec["order"],
            thumbnail_url=lesson_thumbnail_url(rec["course_id"], rec["id"]),
        )
        for rec in sorted(items, key=lambda x: x["order"])
    ]


def get_recent_courses() -> list:
    """MVP: return empty. Replace with user-specific logic."""
    return []


def get_course_progress(course_id: int):
    """MVP: return stub progress. Replace with DB lookup."""
    from app.models import CourseProgress
    return CourseProgress(course_id=course_id, progress_percent=0)


def get_lesson_detail(lesson_id: int) -> LessonDetail | None:
    for rec in LESSONS:
        if rec["id"] != lesson_id:
            continue
        sections = [LessonSection(start=s["start"], end=s["end"], notation=s["notation"]) for s in rec.get("sections", [])]
        return LessonDetail(
            id=rec["id"],
            course_id=rec["course_id"],
            title=rec["title"],
            description=rec.get("description"),
            video_url=lesson_video_url(rec["course_id"], rec["id"]),
            audio_url=lesson_audio_url(rec["course_id"], rec["id"]),
            notation_url=lesson_notation_url(rec["course_id"], rec["id"]),
            thumbnail_url=lesson_thumbnail_url(rec["course_id"], rec["id"]),
            sections=sections if sections else None,
        )
    return None
