import type { ComponentType } from 'react';
import type { LessonDetail } from '@/src/types/models';
import type { Note } from '@/src/utils/notation';

export interface LessonPlayerProps {
  lesson: LessonDetail;
  notes?: Note[];
  onComplete: () => void;
  onProgress: (percent: number, positionSeconds: number) => void;
  /** Ordered list of lesson IDs in the course (for prev/next nav). */
  lessonIds?: string[];
  /** Index of current lesson in lessonIds. */
  currentLessonIndex?: number;
}

export interface NotationPanelProps {
  lesson: LessonDetail;
  isPlaying: boolean;
  currentPositionSeconds: number;
}

export type InstrumentNotationData = unknown; // Each plugin narrows this type

export interface InstrumentPlugin {
  slug: string;
  displayName: string;
  PlayerScreen: ComponentType<LessonPlayerProps>;
  NotationPanel?: ComponentType<NotationPanelProps>;
  parseNotation: (raw: unknown) => InstrumentNotationData;
  supportsGuidedPractice: boolean;
  supportsBpm: boolean;
}
