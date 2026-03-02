import { StyleSheet } from 'react-native';
import { DesignSystem } from './theme';

export const authStyles = StyleSheet.create({
  // iOS Safe Area Container
  safeAreaContainer: {
    flex: 1,
    backgroundColor: DesignSystem.colors.primary,
  },

  // Common container styles
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },

  // Sign In specific styles
  signInContainer: {
    width: '100%',
    maxWidth: 400,
    ...DesignSystem.components.glassCard,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.25,
    shadowRadius: 50,
    elevation: 25,
    padding: 40,
  },

  // Sign Up specific styles
  signUpContainer: {
    width: '100%',
    maxWidth: 400,
    ...DesignSystem.components.glassCard,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.25,
    shadowRadius: 50,
    elevation: 25,
    padding: 40,
  },

  // Back button styles
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
    fontWeight: '300',
  },
  backText: {
    fontSize: 16,
    color: DesignSystem.colors.white,
    fontWeight: '400',
  },

  // Title styles
  titleContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '500',
    color: DesignSystem.colors.white,
    textAlign: 'center',
    lineHeight: 42,
  },

  // Subtitle styles
  subtitleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: DesignSystem.colors.whiteOverlay['70'],
    textAlign: 'center',
    lineHeight: 22.5,
  },

  // Form styles
  formContainer: {
    marginBottom: 32,
  },
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
    fontWeight: '400',
    color: DesignSystem.colors.whiteOverlay['60'],
    lineHeight: 17,
  },

  // Button styles
  buttonContainer: {
    alignItems: 'center',
  },
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
    fontWeight: '600',
    color: DesignSystem.colors.primary,
    textAlign: 'center',
    lineHeight: 25.5,
  },

  // Footer styles
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  footerText: {
    fontSize: 14,
    fontWeight: '400',
    color: DesignSystem.colors.whiteOverlay['70'],
    textAlign: 'center',
    lineHeight: 21,
  },
  linkContainer: {
    marginLeft: 4,
  },
  linkText: {
    fontSize: 16,
    fontWeight: '500',
    color: DesignSystem.colors.white,
    textAlign: 'center',
    lineHeight: 24,
  },

  // Social login styles
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
  socialButtonIcon: {
    fontSize: 20,
    color: '#1f2937',
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },

  // Divider styles
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
    fontWeight: '400',
  },

  // Terms styles
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  termsText: {
    fontSize: 12,
    fontWeight: '400',
    color: DesignSystem.colors.whiteOverlay['50'],
    textAlign: 'center',
    lineHeight: 19.5,
  },
});
