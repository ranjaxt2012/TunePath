export interface Level {
  id: string;
  name: string;
  description: string;
  difficulty: number; // 1-5 scale
}

export const LEVELS: Level[] = [
  {
    id: 'beginner',
    name: 'Beginner',
    description: 'Perfect for those just starting their musical journey',
    difficulty: 1,
  },
  {
    id: 'intermediate',
    name: 'Intermediate', 
    description: 'For those with some musical experience',
    difficulty: 3,
  },
  {
    id: 'advanced',
    name: 'Advanced',
    description: 'For experienced musicians seeking mastery',
    difficulty: 5,
  }
];

export type LevelId = 'beginner' | 'intermediate' | 'advanced';

/**
 * Gets level information by ID
 * @param levelId - The level ID
 * @returns Level object or null if not found
 */
export const getLevelById = (levelId: string): Level | null => {
  return LEVELS.find(level => level.id === levelId) || null;
};

/**
 * Gets all available levels
 * @returns Array of all levels
 */
export const getAllLevels = (): Level[] => {
  return LEVELS;
};
