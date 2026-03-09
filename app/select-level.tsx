import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { authStyles } from '../src/styles/index';
import { selectLevelStyles } from '../src/styles/selectLevelStyles';

type Level = "beginner" | "intermediate" | "advanced" | null;

export default function SelectLevelScreen() {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState<Level>(null);
  
  const handleLevelSelect = async (level: string) => {
    setSelectedLevel(level as Level);
    try {
      await AsyncStorage.setItem('selectedLevel', level);
      router.push('/select-lesson' as any);
    } catch (error) {
      console.error('Error saving level:', error);
    }
  };

  return (
    <View style={authStyles.safeAreaContainer}>
      <View style={selectLevelStyles.backgroundGradient}>
        {/* Back Button */}
        <View style={selectLevelStyles.backButtonContainer}>
          <Pressable 
            style={({ pressed }) => [selectLevelStyles.backButton, { opacity: pressed ? 0.8 : 1 }]}
            onPress={() => router.push('/select-instrument')}
          >
            <Text style={selectLevelStyles.backIcon}>‹</Text>
            <Text style={selectLevelStyles.backText}>Back</Text>
          </Pressable>
        </View>

        {/* Header */}
        <View style={selectLevelStyles.headerContainer}>
          <Text style={selectLevelStyles.title}>Select Your Level</Text>
          <Text style={selectLevelStyles.subtitle}>We'll tailor exercises to your experience.</Text>
        </View>

        {/* Level Options */}
        <View style={selectLevelStyles.levelsContainer}>
          {/* Beginner */}
          <Pressable 
            style={({ pressed }) => [
              selectLevelStyles.levelCard,
              selectedLevel === 'beginner' ? selectLevelStyles.levelCardSelected : selectLevelStyles.levelCardUnselected,
              { opacity: pressed ? 0.8 : 1 }
            ]}
            onPress={() => handleLevelSelect('beginner')}
          >
            <View style={selectLevelStyles.levelHeader}>
              <Text style={selectLevelStyles.levelTitle}>Beginner</Text>
              <Text style={selectLevelStyles.levelSubtitle}>Just getting started</Text>
            </View>
          </Pressable>

          {/* Intermediate */}
          <Pressable 
            style={({ pressed }) => [
              selectLevelStyles.levelCard,
              selectedLevel === 'intermediate' ? selectLevelStyles.levelCardSelected : selectLevelStyles.levelCardUnselected,
              { opacity: pressed ? 0.8 : 1 }
            ]}
            onPress={() => handleLevelSelect('intermediate')}
          >
            <View style={selectLevelStyles.levelHeader}>
              <Text style={selectLevelStyles.levelTitle}>Intermediate</Text>
              <Text style={selectLevelStyles.levelSubtitle}>Some experience</Text>
            </View>
          </Pressable>

          {/* Advanced */}
          <Pressable 
            style={({ pressed }) => [
              selectLevelStyles.levelCard,
              selectedLevel === 'advanced' ? selectLevelStyles.levelCardSelected : selectLevelStyles.levelCardUnselected,
              { opacity: pressed ? 0.8 : 1 }
            ]}
            onPress={() => handleLevelSelect('advanced')}
          >
            <View style={selectLevelStyles.levelHeader}>
              <Text style={selectLevelStyles.levelTitle}>Advanced</Text>
              <Text style={selectLevelStyles.levelSubtitle}>Confident player</Text>
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

