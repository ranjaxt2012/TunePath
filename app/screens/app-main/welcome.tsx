import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { welcomeStyles } from '../../../src/styles/welcomeStyles';

export default function WelcomeScreen() {
  const router = useRouter();
  
  const handleGetStarted = () => {
    console.log('Get Started pressed!');
    router.push('/(auth)/sign-in' as any);
  };

  return (
    <View style={welcomeStyles.container}>
      {/* Background gradient container */}
      <View style={welcomeStyles.backgroundGradient}>
        {/* Logo Circle */}
        <View style={welcomeStyles.logoContainer}>
          <View style={welcomeStyles.logoCircle}>
            <Text style={welcomeStyles.logoIcon}>♪</Text>
          </View>
        </View>

        {/* Title */}
        <View style={welcomeStyles.titleContainer}>
          <Text style={welcomeStyles.title}>TunePath</Text>
        </View>

        {/* Subtitle */}
        <View style={welcomeStyles.subtitleContainer}>
          <Text style={welcomeStyles.subtitle}>Your Music Journey Starts Here</Text>
        </View>

        {/* Button */}
        <View style={welcomeStyles.buttonContainer}>
          <Pressable 
            onPress={handleGetStarted}
            style={({ pressed }) => [
              welcomeStyles.button,
              { opacity: pressed ? 0.8 : 1 }
            ]}
          >
            <Text style={welcomeStyles.buttonText}>Get Started</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
