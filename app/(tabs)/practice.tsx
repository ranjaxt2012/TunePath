import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { BottomTabBar } from '../../src/components/ui';
import { practiceStyles } from '../../src/styles/practiceStyles';

// Instrument Card Component
const InstrumentCard = React.memo(function InstrumentCard({ name, level, icon, isActive }: { name: string; level: string; icon: string; isActive?: boolean }) {
  return (
    <View style={[
      practiceStyles.instrumentCard,
      isActive ? practiceStyles.instrumentCardActive : practiceStyles.instrumentCardInactive
    ]}>
      <View style={practiceStyles.instrumentCardContent}>
        <Text style={practiceStyles.instrumentIcon}>{icon}</Text>
        <Text style={practiceStyles.instrumentName}>{name}</Text>
        <Text style={practiceStyles.instrumentLevel}>{level}</Text>
      </View>
    </View>
  );
});

// Lesson Card Component
const LessonCard = React.memo(function LessonCard({ title, duration, progress, onPress }: { title: string; duration: string; progress: number; onPress: () => void }) {
  return (
    <View style={practiceStyles.lessonCard}>
      <View style={practiceStyles.lessonHeader}>
        <View style={practiceStyles.lessonInfo}>
          <Text style={practiceStyles.lessonTitle}>{title}</Text>
          <Text style={practiceStyles.lessonDuration}>{duration}</Text>
        </View>
        <Pressable style={({ pressed }) => [practiceStyles.startButton, { opacity: pressed ? 0.8 : 1 }]} onPress={onPress}>
          <Text style={practiceStyles.startButtonText}>Start</Text>
        </Pressable>
      </View>
      
      {/* Progress Bar */}
      <View style={practiceStyles.progressBarContainer}>
        <View style={[practiceStyles.progressBar, { width: `${progress}%` }]} />
      </View>
    </View>
  );
});

const INSTRUMENTS = [
  { name: 'Harmonium', level: 'Beginner', icon: '🎵', isActive: true },
  { name: 'Guitar', level: 'Not Started', icon: '🎸' },
  { name: 'Piano', level: 'Not Started', icon: '🎹' },
  { name: 'Vocals', level: 'Not Started', icon: '🎤' },
];

const LESSON_DATA = [
  { title: 'Raag Yaman Basics', duration: '10 mins', progress: 60 },
  { title: 'Scale Practice', duration: '15 mins', progress: 30 },
  { title: 'Rhythm Exercises', duration: '12 mins', progress: 0 },
];

export default function PracticeScreen() {
  const router = useRouter();

  const goToLessonPlayer = useCallback(() => router.push('/lesson-player'), [router]);

  return (
    <View style={practiceStyles.container}>
      {/* Header */}
      <View style={practiceStyles.headerContainer}>
        <Text style={practiceStyles.title}>Practice</Text>
      </View>

      {/* Main Content */}
      <ScrollView style={practiceStyles.mainContent} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Choose Instrument Section */}
        <View style={practiceStyles.section}>
          <Text style={practiceStyles.sectionTitle}>Choose Your Instrument</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={practiceStyles.instrumentsScroll}>
            {INSTRUMENTS.map((instrument) => (
              <InstrumentCard
                key={instrument.name}
                name={instrument.name}
                level={instrument.level}
                icon={instrument.icon}
                isActive={instrument.isActive}
              />
            ))}
          </ScrollView>
        </View>

        {/* Available Lessons Section */}
        <View style={practiceStyles.section}>
          <Text style={practiceStyles.sectionTitle}>Available Lessons</Text>
          <View style={practiceStyles.lessonsContainer}>
            {LESSON_DATA.map((lesson) => (
              <LessonCard
                key={lesson.title}
                title={lesson.title}
                duration={lesson.duration}
                progress={lesson.progress}
                onPress={goToLessonPlayer}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <BottomTabBar activeTab="practice" />
    </View>
  );
}
