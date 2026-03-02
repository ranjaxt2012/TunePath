import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { authStyles } from '../../src/styles/authStyles';

export default function SignUpScreen() {
  const router = useRouter();
  
  const handleSignUp = () => {
    console.log('Sign Up pressed!');
    router.push('/select-instrument' as any);
  };

  return (
    <View style={authStyles.safeAreaContainer}>
      <View style={authStyles.container}>
        {/* Back Button */}
        <View style={authStyles.backButtonContainer}>
          <Pressable 
            style={({ pressed }) => [authStyles.backButton, { opacity: pressed ? 0.8 : 1 }]}
            onPress={() => router.push('/(auth)/sign-in')}
          >
            <Text style={authStyles.backIcon}>‹</Text>
            <Text style={authStyles.backText}>Back</Text>
          </Pressable>
        </View>

        {/* Sign Up Container */}
        <View style={authStyles.signUpContainer}>
          {/* Title */}
          <View style={authStyles.titleContainer}>
            <Text style={authStyles.title}>Create Your Account</Text>
          </View>

          {/* Subtitle */}
          <View style={authStyles.subtitleContainer}>
            <Text style={authStyles.subtitle}>Start your music journey today.</Text>
          </View>

          {/* Form */}
          <View style={authStyles.formContainer}>
            {/* Full Name Input */}
            <View style={authStyles.inputContainer}>
              <Text style={authStyles.inputText}>Full Name</Text>
            </View>

            {/* Email Input */}
            <View style={authStyles.inputContainer}>
              <Text style={authStyles.inputText}>Email</Text>
            </View>

            {/* Password Input */}
            <View style={authStyles.inputContainer}>
              <Text style={authStyles.inputText}>Password</Text>
            </View>

            {/* Create Account Button */}
            <View style={authStyles.buttonContainer}>
              <Pressable 
                onPress={handleSignUp}
                style={({ pressed }) => [
                  authStyles.button,
                  { opacity: pressed ? 0.8 : 1 }
                ]}
              >
                <Text style={authStyles.buttonText}>Create Account</Text>
              </Pressable>
            </View>
          </View>

          {/* Terms */}
          <View style={authStyles.termsContainer}>
            <Text style={authStyles.termsText}>
              By creating an account, you agree to our 
            </Text>
            <View style={authStyles.linkContainer}>
              <Text style={authStyles.linkText}>Terms</Text>
            </View>
            <Text style={authStyles.termsText}> & </Text>
            <View style={authStyles.linkContainer}>
              <Text style={authStyles.linkText}>Privacy Policy</Text>
            </View>
            <Text style={authStyles.termsText}>.</Text>
          </View>

          {/* Footer */}
          <View style={authStyles.footerContainer}>
            <Text style={authStyles.footerText}>
              Already have an account? 
            </Text>
            <View style={authStyles.linkContainer}>
              <Pressable onPress={() => router.push('/(auth)/sign-in' as any)}>
                <Text style={authStyles.linkText}>Sign In</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

