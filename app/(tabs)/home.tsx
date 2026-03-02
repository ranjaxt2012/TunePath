import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { homeStyles } from '../../src/styles/homeStyles';

export default function HomeScreen() {
  const router = useRouter();
  const [showHelpLabel, setShowHelpLabel] = useState(false);

  return (
    <View style={homeStyles.container}>
      {/* Header with Back Button */}
      <View style={homeStyles.headerContainer}>
        <Pressable 
          style={({ pressed }) => [homeStyles.backButton, { opacity: pressed ? 0.8 : 1 }]}
          onPress={() => router.push('/select-level')}
        >
          <Text style={homeStyles.backIcon}>‹</Text>
          <Text style={homeStyles.backText}>Back</Text>
        </Pressable>
        <View style={homeStyles.headerContent}>
          <Text style={homeStyles.welcomeTitle}>Welcome back</Text>
          <Text style={homeStyles.welcomeSubtitle}>Ready to practice?</Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={homeStyles.mainContent}>
        {/* Large Card - Continue Practice */}
        <View style={homeStyles.largeCard}>
          <Text style={homeStyles.cardTitle}>Continue Practice</Text>
          <Text style={homeStyles.cardSubtitle}>Harmonium – Beginner</Text>
          <Pressable 
            style={({ pressed }) => [homeStyles.primaryButton, { opacity: pressed ? 0.8 : 1 }]}
            onPress={() => router.push('/lesson-player')}
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
            onPress={() => router.push('/lesson-player')}
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

      {/* Help and Resources */}
      <View style={homeStyles.helpResourcesContainer}>
        <View style={homeStyles.helpButtonWrapper}>
          <Pressable 
            style={({ pressed }) => [homeStyles.helpButton, { opacity: pressed ? 0.8 : 1 }]}
            onPress={() => console.log('Help & Resources pressed')}
            onPressIn={() => setShowHelpLabel(true)}
            onPressOut={() => setShowHelpLabel(false)}
          >
            <Text style={homeStyles.helpIcon}>?</Text>
          </Pressable>
          {showHelpLabel && (
            <View style={homeStyles.hoverLabel}>
              <Text style={homeStyles.hoverLabelText}>Help & Resources</Text>
            </View>
          )}
        </View>
      </View>

      {/* Bottom Tab Bar */}
      <View style={homeStyles.bottomTabBar}>
        <View style={homeStyles.tabBarContent}>
          {/* Home Tab - Active */}
          <Pressable 
            style={homeStyles.tabButton}
            onPress={() => console.log('Already on Home')}
          >
            <Text style={homeStyles.tabIconActive}>🏠</Text>
            <Text style={homeStyles.tabTextActive}>Home</Text>
          </Pressable>

          {/* Practice Tab */}
          <Pressable 
            style={homeStyles.tabButton}
            onPress={() => router.push('/practice')}
          >
            <Text style={homeStyles.tabIconInactive}>🎵</Text>
            <Text style={homeStyles.tabTextInactive}>Practice</Text>
          </Pressable>

          {/* Progress Tab */}
          <Pressable 
            style={homeStyles.tabButton}
            onPress={() => router.push('/progress')}
          >
            <Text style={homeStyles.tabIconInactive}>📊</Text>
            <Text style={homeStyles.tabTextInactive}>Progress</Text>
          </Pressable>

          {/* Profile Tab */}
          <Pressable 
            style={homeStyles.tabButton}
            onPress={() => router.push('/profile')}
          >
            <Text style={homeStyles.tabIconInactive}>👤</Text>
            <Text style={homeStyles.tabTextInactive}>Profile</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
