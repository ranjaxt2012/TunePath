import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function WelcomeScreen() {
  const router = useRouter();
  
  const handleGetStarted = () => {
    console.log('Get Started pressed!');
    router.push('/(auth)/sign-in' as any);
  };

  return (
    <View style={styles.container}>
      {/* Background gradient container */}
      <View style={styles.backgroundGradient}>
        {/* Logo Circle */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoIcon}>♪</Text>
          </View>
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>TunePath</Text>
        </View>

        {/* Subtitle */}
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitle}>Your Music Journey Starts Here</Text>
        </View>

        {/* Button */}
        <View style={styles.buttonContainer}>
          <Pressable 
            onPress={handleGetStarted}
            style={({ pressed }) => [
              styles.button,
              { opacity: pressed ? 0.8 : 1 }
            ]}
          >
            <Text style={styles.buttonText}>Get Started</Text>
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoIcon: {
    fontSize: 56,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 48,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -1.2,
  },
  subtitleContainer: {
    alignItems: 'center',
    marginBottom: 56,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 28,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  button: {
    width: 384,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 12,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9810FA',
    textAlign: 'center',
  },
});
