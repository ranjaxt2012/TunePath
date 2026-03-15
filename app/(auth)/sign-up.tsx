import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenGradient } from '@/src/components/common/ScreenGradient';
import { Typography } from '@/src/constants/theme';
import { DesignSystem } from '../../src/styles/theme';

export default function SignUpScreen() {
  const router = useRouter();
  
  const handleSignUp = () => {
    // TODO: add proper logging
    router.push('/select/instrument' as any);
  };

  return (
    <ScreenGradient style={styles.container}>
        {/* Back Button */}
        <View style={styles.backButtonContainer}>
          <Pressable 
            style={({ pressed }) => [styles.backButton, { opacity: pressed ? 0.8 : 1 }]}
            onPress={() => router.push('/(auth)/sign-in')}
          >
            <Text style={styles.backIcon}>‹</Text>
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        </View>

          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Create Your Account</Text>
          </View>

          {/* Subtitle */}
          <View style={styles.subtitleContainer}>
            <Text style={styles.subtitle}>Start your music journey today.</Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Full Name Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputText}>Full Name</Text>
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputText}>Email</Text>
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputText}>Password</Text>
            </View>

            {/* Create Account Button */}
            <View style={styles.buttonContainer}>
              <Pressable 
                onPress={handleSignUp}
                style={({ pressed }) => [
                  styles.button,
                  { opacity: pressed ? 0.8 : 1 }
                ]}
              >
                <Text style={styles.buttonText}>Create Account</Text>
              </Pressable>
            </View>
          </View>

          {/* Terms */}
          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By creating an account, you agree to our 
            </Text>
            <View style={styles.linkContainer}>
              <Text style={styles.linkText}>Terms</Text>
            </View>
            <Text style={styles.termsText}> & </Text>
            <View style={styles.linkContainer}>
              <Text style={styles.linkText}>Privacy Policy</Text>
            </View>
            <Text style={styles.termsText}>.</Text>
          </View>

          {/* Footer */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>
              Already have an account? 
            </Text>
            <View style={styles.linkContainer}>
              <Pressable onPress={() => router.push('/(auth)/sign-in' as any)}>
                <Text style={styles.linkText}>Sign In</Text>
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
  backButtonContainer: {
    position: 'absolute',
    top: 60,
    left: 40,
    zIndex: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backIcon: {
    fontSize: 24,
    color: DesignSystem.colors.white,
    fontFamily: Typography.regular,
  },
  backText: {
    fontSize: 16,
    color: DesignSystem.colors.white,
    fontFamily: Typography.regular,
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
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  termsText: {
    fontSize: 12,
    fontFamily: Typography.regular,
    color: DesignSystem.colors.whiteOverlay['50'],
    textAlign: 'center',
    lineHeight: 19.5,
  },
  linkContainer: { marginLeft: 4 },
  linkText: {
    fontSize: 16,
    fontFamily: Typography.medium,
    color: DesignSystem.colors.white,
    textAlign: 'center',
    lineHeight: 24,
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
});

