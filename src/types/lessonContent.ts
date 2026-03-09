/**
 * Lesson content types - matches lesson.json structure
 */

export interface LessonSection {
  id?: string;
  start: number;
  end: number;
  notation: string;
  /** Support for startSec/endSec from alternative format */
  startSec?: number;
  endSec?: number;
  extra?: Record<string, unknown>;
}

export interface LessonData {
  id: string;
  title: string;
  instrument: string;
  level: string;
  video: string;
  /** Support for videoFile from alternative format */
  videoFile?: string;
  notationType?: string;
  sections: LessonSection[];
}
