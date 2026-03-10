import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { LEVELS } from '../src/constants/levels';
import { authStyles } from '../src/styles/index';
import { selectLevelStyles } from '../src/styles/selectLevelStyles';

export default function SelectLevelScreen() {
  const router = useRouter();
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const handleLevelSelect = async (slug: string) => {
    setSelectedSlug(slug);
    try {
      await AsyncStorage.setItem('selectedLevel', slug);
      router.push('/select-course' as any);
    } catch (error) {
      console.error('Error saving level:', error);
    }
  };

  return (
    <View style={authStyles.safeAreaContainer}>
      <View style={selectLevelStyles.backgroundGradient}>
        <View style={selectLevelStyles.backButtonContainer}>
          <Pressable
            style={({ pressed }) => [selectLevelStyles.backButton, { opacity: pressed ? 0.8 : 1 }]}
            onPress={() => router.push('/select-instrument')}
          >
            <Text style={selectLevelStyles.backIcon}>‹</Text>
            <Text style={selectLevelStyles.backText}>Back</Text>
          </Pressable>
        </View>

        <View style={selectLevelStyles.headerContainer}>
          <Text style={selectLevelStyles.title}>Select Your Level</Text>
          <Text style={selectLevelStyles.subtitle}>We'll tailor exercises to your experience.</Text>
        </View>

        <View style={selectLevelStyles.levelsContainer}>
          {LEVELS.map((level) => (
            <Pressable
              key={level.slug}
              style={({ pressed }) => [
                selectLevelStyles.levelCard,
                selectedSlug === level.slug ? selectLevelStyles.levelCardSelected : selectLevelStyles.levelCardUnselected,
                { opacity: pressed ? 0.8 : 1 },
              ]}
              onPress={() => handleLevelSelect(level.slug)}
            >
              <View style={selectLevelStyles.levelHeader}>
                <Text style={selectLevelStyles.levelTitle}>{level.title}</Text>
                <Text style={selectLevelStyles.levelSubtitle}>
                  {level.slug === 'beginner' ? 'Just getting started' : level.slug === 'intermediate' ? 'Some experience' : 'Confident player'}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

