# Content Structure

## Lesson Player Model

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

Add new lessons to `src/services/lessonLoader.ts` and create the corresponding folder with `lesson.json` and video file.
