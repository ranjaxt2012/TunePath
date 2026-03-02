import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { welcomeStyles } from '../../src/styles/welcomeStyles';

export default function WelcomeScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/sign-in' as any);
  };

  return (
    <View style={welcomeStyles.container}>
      <View style={welcomeStyles.backgroundGradient}>
        <View style={welcomeStyles.logoContainer}>
          <View style={welcomeStyles.logoCircle}>
            <Text style={welcomeStyles.logoIcon}>🎵</Text>
          </View>
        </View>
        
        <View style={welcomeStyles.titleContainer}>
          <Text style={welcomeStyles.title}>TunePath</Text>
        </View>
        
        <View style={welcomeStyles.subtitleContainer}>
          <Text style={welcomeStyles.subtitle}>
            Your musical journey starts here
          </Text>
        </View>
        
        <View style={welcomeStyles.buttonContainer}>
          <Pressable onPress={handleGetStarted} style={({ pressed }) => [welcomeStyles.button, { opacity: pressed ? 0.8 : 1 }]}>
            <Text style={welcomeStyles.buttonText}>Get Started</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
