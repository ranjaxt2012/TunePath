import React from 'react';
import { HarmoniumPlayer } from './harmonium/HarmoniumPlayer';
import type { Lesson } from '@/src/types/models';
import type { Note } from './harmonium/SargamPlayerEngine';

interface PlayerProps {
  lesson: Lesson;
  notes?: Note[];
  isTutor?: boolean;
  onComplete?(): void;
}

type PlayerComponent = React.ComponentType<PlayerProps>;

const REGISTRY: Record<string, PlayerComponent> = {
  harmonium: HarmoniumPlayer,
};

export function getPlayer(instrumentSlug: string): PlayerComponent | null {
  return REGISTRY[instrumentSlug] ?? null;
}
