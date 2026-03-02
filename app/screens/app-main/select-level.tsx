import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { selectLevelStyles } from '../../../src/styles/selectLevelStyles';

export default function SelectLevelScreen() {
  const router = useRouter();
  
  const handleLevelSelect = (level: string) => {
    console.log('Level selected:', level);
    router.push('/home' as any);
  };

  return (
    <View style={selectLevelStyles.container}>
      {/* Background gradient */}
      <View style={selectLevelStyles.backgroundGradient}>
        {/* Header */}
        <View style={selectLevelStyles.headerContainer}>
          <Text style={selectLevelStyles.title}>Select Your Level</Text>
          <Text style={selectLevelStyles.subtitle}>Choose your skill level to personalize your experience.</Text>
        </View>

        {/* Level Options */}
        <View style={selectLevelStyles.levelsContainer}>
          {/* Beginner */}
          <Pressable 
            style={({ pressed }) => [
              selectLevelStyles.levelCard,
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
