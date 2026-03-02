import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { practiceStyles } from '../../src/styles/practiceStyles';

// Instrument Card Component
function InstrumentCard({ name, level, icon, isActive }: { name: string; level: string; icon: string; isActive?: boolean }) {
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
}

// Lesson Card Component
function LessonCard({ title, duration, progress, onPress }: { title: string; duration: string; progress: number; onPress: () => void }) {
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
}

export default function PracticeScreen() {
  const router = useRouter();

  const instruments = [
    { name: 'Harmonium', level: 'Beginner', icon: '🎵', isActive: true },
    { name: 'Guitar', level: 'Not Started', icon: '🎸' },
    { name: 'Piano', level: 'Not Started', icon: '🎹' },
    { name: 'Vocals', level: 'Not Started', icon: '🎤' },
  ];

  const lessons = [
    { title: 'Raag Yaman Basics', duration: '10 mins', progress: 60, onPress: () => router.push('/lesson-player') },
    { title: 'Scale Practice', duration: '15 mins', progress: 30, onPress: () => router.push('/lesson-player') },
    { title: 'Rhythm Exercises', duration: '12 mins', progress: 0, onPress: () => router.push('/lesson-player') },
  ];

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
            {instruments.map((instrument) => (
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
            {lessons.map((lesson) => (
              <LessonCard
                key={lesson.title}
                title={lesson.title}
                duration={lesson.duration}
                progress={lesson.progress}
                onPress={lesson.onPress}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Tab Bar */}
      <View style={practiceStyles.bottomTabBar}>
        <View style={practiceStyles.tabBarContent}>
          {/* Home Tab */}
          <Pressable 
            style={practiceStyles.tabButton}
            onPress={() => router.push('/home')}
          >
            <Text style={practiceStyles.tabIconInactive}>🏠</Text>
            <Text style={practiceStyles.tabTextInactive}>Home</Text>
          </Pressable>

          {/* Practice Tab - Active */}
          <Pressable 
            style={practiceStyles.tabButton}
            onPress={() => console.log('Already on Practice')}
          >
            <Text style={practiceStyles.tabIconActive}>🎵</Text>
            <Text style={practiceStyles.tabTextActive}>Practice</Text>
          </Pressable>

          {/* Progress Tab */}
          <Pressable 
            style={practiceStyles.tabButton}
            onPress={() => router.push('/progress')}
          >
            <Text style={practiceStyles.tabIconInactive}>📊</Text>
            <Text style={practiceStyles.tabTextInactive}>Progress</Text>
          </Pressable>

          {/* Profile Tab */}
          <Pressable 
            style={practiceStyles.tabButton}
            onPress={() => router.push('/profile')}
          >
            <Text style={practiceStyles.tabIconInactive}>👤</Text>
            <Text style={practiceStyles.tabTextInactive}>Profile</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
