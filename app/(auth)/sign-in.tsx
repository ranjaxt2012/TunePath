import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function SignInScreen() {
  const router = useRouter();
  
  const handleSignIn = () => {
    console.log('Sign In pressed!');
    router.push('/select-instrument' as any);
  };

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <View style={styles.backgroundGradient}>
        {/* Sign In Container */}
        <View style={styles.signInContainer}>
          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Welcome Back</Text>
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
          </View>

          {/* Footer */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>
              Don't have an account? 
            </Text>
            <View style={styles.linkContainer}>
              <Pressable onPress={() => router.push('/(auth)/sign-up' as any)}>
                <Text style={styles.linkText}>Sign Up</Text>
              </Pressable>
            </View>
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
  signInContainer: {
    width: 400,
    height: 450,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.25,
    shadowRadius: 50,
    elevation: 25,
    padding: 40,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 42,
  },
  subtitleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 22.5,
  },
  formContainer: {
    marginBottom: 32,
  },
  inputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 16,
    justifyContent: 'center',
  },
  inputText: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 17,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  button: {
    width: 318,
    height: 52,
    backgroundColor: '#FFFFFF',
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
    color: '#9810FA',
    textAlign: 'center',
    lineHeight: 25.5,
  },
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  footerText: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 21,
  },
  linkContainer: {
    marginLeft: 4,
  },
  linkText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
  },
});
