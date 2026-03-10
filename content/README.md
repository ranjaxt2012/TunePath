# Content Structure

**TRANSITIONAL:** Backend API is source of truth for lessons. This folder is used only when lessons are opened without `courseId`+`lessonId` (e.g. Practice tab, select-lesson). Do not use folder names or titles for lesson identity—use `course.id` and `lesson.id`.

## Lesson Player Model (local format)

```json
{
  "id": "lesson-001",
  "title": "Basic Sargam",
  "instrument": "harmonium",
  "level": "beginner",
  "video": "lesson.mp4",
  "notationType": "sargam",
  "sections": [
    { "start": 0, "end": 10, "notation": "Sa Re Ga Ma Pa Dha Ni Sa" },
    { "start": 11, "end": 20, "notation": "Sa Ni Dha Pa Ma Ga Re Sa" }
  ]
}
```

## Content Path

```
/content
  /harmonium
    /beginner
      /lesson-001-basics-sargam
        lesson.json
        lesson.MOV
```

All lessons come from backend; media from R2 (see `backend/README.md`). Local content folder is legacy.
