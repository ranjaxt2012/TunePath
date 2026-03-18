import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenGradient } from '@/src/components/common/ScreenGradient';
import { DesignSystem, Typography } from '@/src/constants/theme';

export default function SignInScreen() {
  const router = useRouter();
  
  const handleSignIn = () => {
    // TODO: add proper logging
    router.push('/select/instrument' as any);
  };

  return (
      <ScreenGradient style={styles.container}>
          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>TunePath</Text>
          </View>

          {/* Subtitle */}
          <View style={styles.subtitleContainer}>
            <Text style={styles.subtitle}>Sign in to continue your music journey</Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputText}>Email</Text>
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputText}>Password</Text>
            </View>

            {/* Sign In Button */}
            <View style={styles.buttonContainer}>
              <Pressable 
                onPress={handleSignIn}
                style={({ pressed }) => [
                  styles.button,
                  { opacity: pressed ? 0.8 : 1 }
                ]}
              >
                <Text style={styles.buttonText}>Sign In</Text>
              </Pressable>
            </View>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Auth Buttons */}
            <View style={styles.socialButtonsContainer}>
              {/* Apple */}
              <Pressable 
                style={({ pressed }) => [styles.socialButton, { opacity: pressed ? 0.8 : 1 }]}
                onPress={() => { /* TODO: add Apple Sign In */ }}
              >
                <FontAwesome5 name="apple" size={20} color="#1f2937" brand />
                <Text style={styles.socialButtonText}>Continue with Apple</Text>
              </Pressable>

              {/* Google */}
              <Pressable 
                style={({ pressed }) => [styles.socialButton, { opacity: pressed ? 0.8 : 1 }]}
                onPress={() => { /* TODO: Google Sign In */ }}
              >
                <FontAwesome5 name="google" size={20} color="#1f2937" brand />
                <Text style={styles.socialButtonText}>Continue with Google</Text>
              </Pressable>

              {/* Facebook */}
              <Pressable 
                style={({ pressed }) => [styles.socialButton, { opacity: pressed ? 0.8 : 1 }]}
                onPress={() => { /* TODO: add Facebook Sign In */ }}
              >
                <FontAwesome5 name="facebook" size={20} color="#1f2937" brand />
                <Text style={styles.socialButtonText}>Continue with Facebook</Text>
              </Pressable>

              {/* Guest */}
              <Pressable 
                style={({ pressed }) => [styles.socialButton, { opacity: pressed ? 0.8 : 1 }]}
                onPress={() => { /* TODO: Guest Sign In */ }}
              >
                <FontAwesome5 name="user" size={20} color="#1f2937" />
                <Text style={styles.socialButtonText}>Continue as Guest</Text>
              </Pressable>
            </View>

            {/* Sign Up Link */}
            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>
                Don't have an account?{" "}
              </Text>
              <Pressable onPress={() => router.push('/(auth)/sign-up' as any)}>
                <Text style={styles.linkText}>Sign Up</Text>
              </Pressable>
            </View>
          </View>
        </ScreenGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  titleContainer: { alignItems: 'center', marginBottom: 16 },
  title: {
    fontSize: 28,
    fontFamily: Typography.medium,
    color: DesignSystem.colors.white,
    textAlign: 'center',
    lineHeight: 42,
  },
  subtitleContainer: { alignItems: 'center', marginBottom: 40 },
  subtitle: {
    fontSize: 15,
    fontFamily: Typography.regular,
    color: DesignSystem.colors.whiteOverlay['70'],
    textAlign: 'center',
    lineHeight: 22.5,
  },
  formContainer: { marginBottom: 32 },
  inputContainer: {
    backgroundColor: DesignSystem.colors.whiteOverlay['20'],
    borderWidth: 1,
    borderColor: DesignSystem.colors.whiteOverlay['30'],
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 16,
    justifyContent: 'center',
  },
  inputText: {
    fontSize: 14,
    fontFamily: Typography.regular,
    color: DesignSystem.colors.whiteOverlay['60'],
    lineHeight: 17,
  },
  buttonContainer: { alignItems: 'center' },
  button: {
    width: 318,
    height: 52,
    backgroundColor: DesignSystem.colors.white,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  buttonText: {
    fontSize: 17,
    fontFamily: Typography.semiBold,
    color: DesignSystem.colors.primary,
    textAlign: 'center',
    lineHeight: 25.5,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: DesignSystem.colors.whiteOverlay['30'],
  },
  dividerText: {
    fontSize: 14,
    color: DesignSystem.colors.whiteOverlay['70'],
    fontFamily: Typography.regular,
  },
  socialButtonsContainer: {
    flexDirection: 'column',
    gap: 8,
    marginBottom: 24,
  },
  socialButton: {
    backgroundColor: DesignSystem.colors.whiteOverlay['90'],
    borderWidth: 1,
    borderColor: DesignSystem.colors.whiteOverlay['30'],
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  socialButtonText: {
    fontSize: 16,
    fontFamily: Typography.medium,
    color: '#1f2937',
  },
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  footerText: {
    fontSize: 14,
    fontFamily: Typography.regular,
    color: DesignSystem.colors.whiteOverlay['70'],
    textAlign: 'center',
    lineHeight: 21,
  },
  linkText: {
    fontSize: 16,
    fontFamily: Typography.medium,
    color: DesignSystem.colors.white,
    textAlign: 'center',
    lineHeight: 24,
  },
});

