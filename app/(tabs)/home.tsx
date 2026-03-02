import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { BottomTabBar } from '../../src/components/ui';
import { homeStyles } from '../../src/styles/homeStyles';

export default function HomeScreen() {
  const router = useRouter();
  const goToLessonPlayer = useCallback(() => router.push('/lesson-player'), [router]);
  const goToSelectLevel = useCallback(() => router.push('/select-level'), [router]);

  return (
    <View style={homeStyles.container}>
      {/* Header with Back Button */}
      <View style={homeStyles.headerContainer}>
        <Pressable 
          style={({ pressed }) => [homeStyles.backButton, { opacity: pressed ? 0.8 : 1 }]}
          onPress={goToSelectLevel}
        >
          <Text style={homeStyles.backIcon}>‹</Text>
          <Text style={homeStyles.backText}>Back</Text>
        </Pressable>
      </View>

      {/* Main Content */}
      <View style={homeStyles.mainContent}>
        <View style={homeStyles.headerContent}>
          <Text style={homeStyles.welcomeTitle}>Welcome back</Text>
          <Text style={homeStyles.welcomeSubtitle}>Ready to practice?</Text>
        </View>
        {/* Large Card - Continue Practice */}
        <View style={homeStyles.largeCard}>
          <Text style={homeStyles.cardTitle}>Continue Practice</Text>
          <Text style={homeStyles.cardSubtitle}>Harmonium – Beginner</Text>
          <Pressable 
            style={({ pressed }) => [homeStyles.primaryButton, { opacity: pressed ? 0.8 : 1 }]}
            onPress={goToLessonPlayer}
          >
            <Text style={homeStyles.primaryButtonText}>Start Session</Text>
          </Pressable>
        </View>

        {/* Large Card - Start New Practice */}
        <View style={homeStyles.largeCard}>
          <Text style={homeStyles.cardTitle}>Start New Practice</Text>
          <Text style={homeStyles.cardSubtitle}>Choose a new exercise</Text>
          <Pressable 
            style={({ pressed }) => [homeStyles.primaryButton, { opacity: pressed ? 0.8 : 1 }]}
            onPress={goToLessonPlayer}
          >
            <Text style={homeStyles.primaryButtonText}>Start Session</Text>
          </Pressable>
        </View>

        {/* Smaller Card - Today's Exercise */}
        <View style={homeStyles.smallCard}>
          <Text style={homeStyles.smallCardTitle}>Today's Exercise</Text>
          <Text style={homeStyles.smallCardSubtitle}>Raag Basics – 10 mins</Text>
        </View>
      </View>

      <BottomTabBar activeTab="home" />
    </View>
  );
}
