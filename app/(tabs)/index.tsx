import { StyleSheet, Text, useColorScheme, View } from 'react-native';

import { Colors, Spacing } from '/Users/anupsingh/repo/TunePath/constants/theme';
import { Button } from '/Users/anupsingh/repo/TunePath/src/components/ui/buttons/button';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'unspecified' ? 'light' : colorScheme];

  return (
    <View style={styles.container}>
      {/* Logo Circle */}
      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoIcon}>♪</Text>
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title}>TunePath</Text>

      {/* Tagline */}
      <Text style={styles.tagline}>Your Music Journey Starts Here</Text>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <Button variant="primary" size="lg" style={styles.button}>
          Get Started
        </Button>
        <Button variant="outline" size="lg" style={styles.button}>
          Learn More
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Gradient background simulation
    backgroundColor: '#6366f1',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
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
    color: '#ffffff',
  },
  title: {
    fontSize: 48,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: Spacing.xl,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 18,
    color: 'rgba(0, 0, 0, 0.7)',
    textAlign: 'center',
    marginBottom: Spacing.xl * 3,
    paddingHorizontal: Spacing.lg,
  },
  buttonContainer: {
    gap: Spacing.md,
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  button: {
    minWidth: 140,
  },
});
