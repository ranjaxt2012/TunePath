import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

export default function LessonPlayerScreen() {
  const router = useRouter();
  
  const handleExploreLessons = () => {
    router.push('/home' as any);
  };

  const handleContinueLesson = () => {
    // Navigate to lesson content
  };

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <View style={styles.backgroundGradient}>
        {/* Header */}
        <View style={styles.headerContainer}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Text style={styles.logoIcon}>♪</Text>
            </View>
          </View>
          
          {/* Title */}
          <Text style={styles.title}>TunePath</Text>
          
          {/* Subtitle */}
          <Text style={styles.subtitle}>Your Journey to Musical Mastery</Text>
        </View>

        {/* Continue Learning Section */}
        <View style={styles.continueLearningContainer}>
          <Text style={styles.sectionTitle}>Continue Learning</Text>
          
          {/* Current Lesson Card */}
          <View style={styles.lessonCard} onTouchEnd={handleContinueLesson}>
            <View style={styles.lessonContent}>
              {/* Lesson Icon */}
              <View style={styles.lessonIcon}>
                <Text style={styles.lessonIconText}>🎵</Text>
              </View>
              
              {/* Lesson Info */}
              <View style={styles.lessonInfo}>
                <Text style={styles.lessonTitle}>Raag Basics – Lesson 1</Text>
                <Text style={styles.lessonSubtitle}>Harmonium • Beginner</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Explore Button */}
        <View style={styles.exploreButtonContainer}>
          <View style={styles.exploreButton} onTouchEnd={handleExploreLessons}>
            <Text style={styles.exploreButtonText}>Explore All Lessons</Text>
          </View>
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
  headerContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  logoIcon: {
    fontSize: 48,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  title: {
    fontSize: 36,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 1.025,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    letterSpacing: -2.44,
    lineHeight: 28,
  },
  continueLearningContainer: {
    width: 448,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 25,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -2.25,
    lineHeight: 28,
    marginBottom: 16,
  },
  lessonCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 16,
    paddingTop: 0,
  },
  lessonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  lessonIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'rgba(173, 70, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonIconText: {
    fontSize: 32,
    color: '#FFFFFF',
  },
  lessonInfo: {
    flex: 1,
    gap: 4,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -2.44,
    lineHeight: 27,
  },
  lessonSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: -1.07,
    lineHeight: 20,
  },
  exploreButtonContainer: {
    alignItems: 'center',
  },
  exploreButton: {
    width: 448,
    height: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.25,
    shadowRadius: 50,
    elevation: 25,
  },
  exploreButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9810FA',
    textAlign: 'center',
    letterSpacing: -2.44,
    lineHeight: 28,
  },
});
