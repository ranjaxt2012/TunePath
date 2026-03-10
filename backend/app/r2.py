"""
R2 object path convention: ID-based only (no titles/slugs).
Paths: courses/course_{course_id}/... and lesson_{lesson_id}/...
"""
from app.config import R2_PUBLIC_BASE_URL


def _url(key: str | None) -> str | None:
    if not key:
        return None
    base = R2_PUBLIC_BASE_URL.rstrip("/")
    path = key.lstrip("/")
    return f"{base}/{path}" if path else None


def course_cover_path(course_id: int) -> str:
    return f"courses/course_{course_id}/cover/thumbnail.jpg"


def lesson_media_path(course_id: int, lesson_id: int, filename: str) -> str:
    return f"courses/course_{course_id}/lessons/lesson_{lesson_id}/{filename}"


def course_thumbnail_url(course_id: int) -> str:
    return _url(course_cover_path(course_id)) or ""


def lesson_thumbnail_url(course_id: int, lesson_id: int) -> str:
    return _url(lesson_media_path(course_id, lesson_id, "thumbnail.jpg")) or ""


def lesson_video_url(course_id: int, lesson_id: int) -> str:
    return _url(lesson_media_path(course_id, lesson_id, "video.mp4")) or ""


def lesson_audio_url(course_id: int, lesson_id: int) -> str:
    return _url(lesson_media_path(course_id, lesson_id, "audio.mp3")) or ""


def lesson_notation_url(course_id: int, lesson_id: int) -> str:
    return _url(lesson_media_path(course_id, lesson_id, "notation.json")) or ""
