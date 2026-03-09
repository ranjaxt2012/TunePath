/**
 * SargamDisplay - displays sargam notation lines from lesson sections
 * Tap a line to play its first note (optional)
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DesignSystem } from '../../styles/theme';
import type { LessonSection } from '../../types/lessonContent';

interface SargamDisplayProps {
  sections: LessonSection[];
  currentTimeSec?: number;
  onPlayLine?: (notation: string) => void;
}

export function SargamDisplay({
  sections,
  currentTimeSec = 0,
  onPlayLine,
}: SargamDisplayProps) {
  if (!sections || sections.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Sargam:</Text>
      <View style={styles.lines}>
        {sections.map((section, index) => {
          const isActive =
            currentTimeSec >= section.start &&
            currentTimeSec <= section.end;
          const content = (
            <Text
              style={[styles.line, isActive && styles.lineActive, { pointerEvents: 'none' }]}
            >
              {section.notation}
            </Text>
          );
          if (onPlayLine) {
            return (
              <Pressable
                key={section.id ?? index}
                onPress={() => onPlayLine(section.notation)}
                style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
              >
                {content}
              </Pressable>
            );
          }
          return (
            <View key={section.id ?? index}>
              {content}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: DesignSystem.colors.whiteOverlay['60'],
  },
  lines: {
    gap: 8,
  },
  line: {
    fontSize: 16,
    color: DesignSystem.colors.whiteOverlay['70'],
    lineHeight: 24,
  },
  lineActive: {
    color: DesignSystem.colors.white,
    fontWeight: '600',
    backgroundColor: DesignSystem.colors.whiteOverlay['15'],
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
});
