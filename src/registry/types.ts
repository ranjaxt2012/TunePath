import type { ComponentType } from 'react';
import type { LessonDetail } from '@/src/types/models';

export interface LessonPlayerProps {
  lesson: LessonDetail;
  onComplete: () => void;
  onProgress: (percent: number, positionSeconds: number) => void;
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
