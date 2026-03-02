import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function SelectLevelScreen() {
  const router = useRouter();
  
  const handleLevelSelect = (level: string) => {
    console.log('Level selected:', level);
    router.push('/home' as any);
  };

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <View style={styles.backgroundGradient}>
        {/* Back Button */}
        <View style={styles.backButtonContainer}>
          <Pressable 
            style={({ pressed }) => [styles.backButton, { opacity: pressed ? 0.8 : 1 }]}
            onPress={() => router.push('/select-instrument')}
          >
            <Text style={styles.backIcon}>‹</Text>
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        </View>

        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Select Your Level</Text>
        </View>

        {/* Level Options */}
        <View style={styles.levelsContainer}>
          {/* Beginner */}
          <Pressable 
            style={({ pressed }) => [
              styles.levelCard,
              { opacity: pressed ? 0.8 : 1 }
            ]}
            onPress={() => handleLevelSelect('beginner')}
          >
            <View style={styles.levelHeader}>
              <Text style={styles.levelTitle}>Beginner</Text>
              <Text style={styles.levelSubtitle}>Just getting started</Text>
            </View>
          </Pressable>

          {/* Intermediate */}
          <Pressable 
            style={({ pressed }) => [
              styles.levelCard,
              { opacity: pressed ? 0.8 : 1 }
            ]}
            onPress={() => handleLevelSelect('intermediate')}
          >
            <View style={styles.levelHeader}>
              <Text style={styles.levelTitle}>Intermediate</Text>
              <Text style={styles.levelSubtitle}>Some experience</Text>
            </View>
          </Pressable>

          {/* Advanced */}
          <Pressable 
            style={({ pressed }) => [
              styles.levelCard,
              { opacity: pressed ? 0.8 : 1 }
            ]}
            onPress={() => handleLevelSelect('advanced')}
          >
            <View style={styles.levelHeader}>
              <Text style={styles.levelTitle}>Advanced</Text>
              <Text style={styles.levelSubtitle}>Confident player</Text>
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Gradient background: linear-gradient(135deg, rgba(152, 16, 250, 1) 0%, rgba(173, 70, 255, 1) 50%, rgba(43, 127, 255, 1) 100%)
    backgroundColor: '#9810FA',
  },
  backgroundGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonContainer: {
    position: 'absolute',
    top: 60,
    left: 24,
    zIndex: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backIcon: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  backText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 36,
  },
  levelsContainer: {
    flexDirection: 'column',
    gap: 16,
    alignItems: 'stretch',
  },
  levelCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0)',
    borderRadius: 20,
    padding: 26,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  levelHeader: {
    alignItems: 'center',
    gap: 8,
  },
  levelTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 30,
  },
  levelSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 20,
  },
});
