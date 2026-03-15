import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { ScreenGradient } from '@/src/components/common/ScreenGradient';
import { Colors } from '@/src/constants/theme';
import { welcomeStyles } from '../../src/styles/welcomeStyles';

export default function WelcomeScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/sign-in' as any);
  };

  return (
    <ScreenGradient style={welcomeStyles.container}>
      <View style={welcomeStyles.backgroundGradient}>
        <View style={welcomeStyles.logoContainer}>
          <View style={welcomeStyles.logoCircle}>
            <Ionicons name="musical-notes" size={64} color={Colors.textPrimary} />
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
    </ScreenGradient>
  );
}
