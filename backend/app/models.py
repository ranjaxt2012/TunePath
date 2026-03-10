"""
Data models. Identity is ID-based; titles are display-only.
"""
from typing import Optional

from pydantic import BaseModel


class LessonSection(BaseModel):
    start: float
    end: float
    notation: str


class Course(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    instrument: str
    level: str
    tutor_name: str
    thumbnail_url: Optional[str] = None


class LessonListItem(BaseModel):
    """Lightweight for list - id, title, lesson_order, thumbnail only."""
    id: int
    course_id: int
    title: str
    lesson_order: int
    thumbnail_url: Optional[str] = None


class LessonDetail(BaseModel):
    """Full lesson with media URLs for detail view."""
    id: int
    course_id: int
    title: str
    description: Optional[str] = None
    video_url: Optional[str] = None
    audio_url: Optional[str] = None
    notation_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    sections: Optional[list[LessonSection]] = None


class CourseProgress(BaseModel):
    course_id: int
    started: Optional[bool] = True
    completed: Optional[bool] = False
    current_lesson_id: Optional[int] = None
    last_lesson_id: Optional[int] = None
    last_position_seconds: Optional[int] = None
    progress_percent: float = 0
    last_accessed_at: Optional[str] = None
