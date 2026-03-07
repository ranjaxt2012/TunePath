import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { BottomTabBar } from '../../src/components/ui';
import { homeStyles } from '../../src/styles/homeStyles';
import { getLevelById } from '../../src/types/levelTypes';
import { getInstrumentNotation } from '../../src/utils/instrumentUtils';

export default function HomeScreen() {
  const router = useRouter();
  const [currentInstrument, setCurrentInstrument] = useState<string>('Harmonium');
  const [currentLevel, setCurrentLevel] = useState<string>('beginner');
  
  // Load saved selections on component mount and when screen comes into focus
  useEffect(() => {
    (async () => {
      try {
        const savedInstrument = await AsyncStorage.getItem('selectedInstrument');
        const savedLevel = await AsyncStorage.getItem('selectedLevel');
        
        if (savedInstrument) {
          setCurrentInstrument(savedInstrument);
        }
        if (savedLevel) {
          setCurrentLevel(savedLevel);
        }
      } catch (error) {
        console.error('Error loading saved selections:', error);
      }
    })();
  }, []);

  // Reload selections when screen comes into focus (after user navigates back from other screens)
  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      (async () => {
        try {
          const savedInstrument = await AsyncStorage.getItem('selectedInstrument');
          const savedLevel = await AsyncStorage.getItem('selectedLevel');
          
          if (savedInstrument) {
            setCurrentInstrument(savedInstrument);
          }
          if (savedLevel) {
            setCurrentLevel(savedLevel);
          }
        } catch (error) {
          console.error('Error reloading selections:', error);
        }
      })();
    }
  }, [isFocused]);
  
  const instrumentData = getInstrumentNotation(currentInstrument);
  const levelData = getLevelById(currentLevel);
  
  const goToLessonPlayer = useCallback(() => {
    // In a real app, pass as route params
    router.push('/lesson-player');
  }, [router]);
  
  const goToSelectLevel = useCallback(() => router.push('/select-level'), [router]);
  const goToSelectInstrument = useCallback(() => router.push('/select-instrument'), [router]);

  return (
    <View style={homeStyles.container}>
      {/* Header with Back Button */}
      <View style={homeStyles.headerContainer}>
        <Pressable 
          style={({ pressed }) => [homeStyles.backButton, { opacity: pressed ? 0.8 : 1 }]}
          onPress={() => router.push('/select-instrument')}
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
          <Text style={homeStyles.cardSubtitle}>
            {instrumentData && levelData ? `${instrumentData.instrument} – ${levelData.name}` : 'Loading...'}
          </Text>
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
            onPress={goToSelectInstrument}
          >
            <Text style={homeStyles.primaryButtonText}>Choose Instrument</Text>
          </Pressable>
        </View>

        {/* Medium Card - Change Level */}
        <View style={homeStyles.mediumCard}>
          <Text style={homeStyles.cardTitle}>Change Level</Text>
          <Text style={homeStyles.cardSubtitle}>
            Current: {levelData ? levelData.name : 'Loading...'}
          </Text>
          <Pressable 
            style={({ pressed }) => [homeStyles.secondaryButton, { opacity: pressed ? 0.8 : 1 }]}
            onPress={goToSelectLevel}
          >
            <Text style={homeStyles.secondaryButtonText}>Select Level</Text>
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
