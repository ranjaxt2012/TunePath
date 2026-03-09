/**
 * Lesson Loader - loads lesson.json from content folders
 * Uses static require() for Metro bundler compatibility (assets must be statically resolvable)
 */

import type { LessonData } from '../types/lessonContent';

export type LessonKey =
  | 'harmonium/beginner/lesson-001-basics-sargam'
  | 'harmonium/beginner/lesson-002-basics-sargam';

/* eslint-disable @typescript-eslint/no-require-imports -- Metro needs static require for asset bundling */
const LESSON_MAP: Record<LessonKey, { json: LessonData; video: number }> = {
  'harmonium/beginner/lesson-001-basics-sargam': {
    json: require('../../content/harmonium/beginner/lesson-001-basics-sargam/lesson.json') as LessonData,
    video: require('../../assets/videos/lesson-001-basics-sargam.MOV'),
  },
  'harmonium/beginner/lesson-002-basics-sargam': {
    json: require('../../content/harmonium/beginner/lesson-002-basics-sargam/lesson.json') as LessonData,
    video: require('../../assets/videos/lesson-002-basics-sargam.MOV'),
  },
};
/* eslint-enable @typescript-eslint/no-require-imports */

/** Returns all available lesson keys for the selection screen */
export function getAllLessonKeys(): LessonKey[] {
  return Object.keys(LESSON_MAP) as LessonKey[];
}

function normalizeSection(section: LessonData['sections'][0]) {
  return {
    start: section.start ?? section.startSec ?? 0,
    end: section.end ?? section.endSec ?? 0,
    notation: section.notation,
  };
}

/**
 * Loads lesson data for the given path
 * @param lessonPath - e.g. 'harmonium/beginner/lesson-001-basics-sargam'
 */
export function loadLesson(lessonPath: LessonKey): LessonData & { videoSource: number } {
  const entry = LESSON_MAP[lessonPath];
  if (!entry) {
    throw new Error(`Lesson not found: ${lessonPath}`);
  }

  const json = entry.json;
  const rawJson = json as unknown as Record<string, unknown>;
  const videoFile = (rawJson.video as string) ?? (rawJson.videoFile as string) ?? 'lesson.mov';

  return {
    id: rawJson.id as string,
    title: rawJson.title as string,
    instrument: (rawJson.instrument as string) ?? 'harmonium',
    level: (rawJson.level as string) ?? 'beginner',
    video: videoFile,
    notationType: rawJson.notationType as string | undefined,
    sections: ((rawJson.sections as LessonData['sections']) ?? []).map(normalizeSection),
    videoSource: entry.video,
  };
}
