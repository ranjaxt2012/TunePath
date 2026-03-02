import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { authStyles } from '../../src/styles/authStyles';

export default function SignInScreen() {
  const router = useRouter();
  
  const handleSignIn = () => {
    console.log('Sign In pressed!');
    router.push('/select-instrument' as any);
  };

  return (
    <View style={authStyles.safeAreaContainer}>
      <View style={authStyles.container}>
        {/* Sign In Container */}
        <View style={authStyles.signInContainer}>
          {/* Title */}
          <View style={authStyles.titleContainer}>
            <Text style={authStyles.title}>Welcome Back</Text>
          </View>

          {/* Subtitle */}
          <View style={authStyles.subtitleContainer}>
            <Text style={authStyles.subtitle}>Sign in to continue your music journey</Text>
          </View>

          {/* Form */}
          <View style={authStyles.formContainer}>
            {/* Email Input */}
            <View style={authStyles.inputContainer}>
              <Text style={authStyles.inputText}>Email</Text>
            </View>

            {/* Password Input */}
            <View style={authStyles.inputContainer}>
              <Text style={authStyles.inputText}>Password</Text>
            </View>

            {/* Sign In Button */}
            <View style={authStyles.buttonContainer}>
              <Pressable 
                onPress={handleSignIn}
                style={({ pressed }) => [
                  authStyles.button,
                  { opacity: pressed ? 0.8 : 1 }
                ]}
              >
                <Text style={authStyles.buttonText}>Sign In</Text>
              </Pressable>
            </View>

            {/* Divider */}
            <View style={authStyles.dividerContainer}>
              <View style={authStyles.dividerLine} />
              <Text style={authStyles.dividerText}>or continue with</Text>
              <View style={authStyles.dividerLine} />
            </View>

            {/* Social Auth Buttons */}
            <View style={authStyles.socialButtonsContainer}>
              {/* Apple */}
              <Pressable 
                style={({ pressed }) => [authStyles.socialButton, { opacity: pressed ? 0.8 : 1 }]}
                onPress={() => console.log('Apple Sign In pressed')}
              >
                <Text style={authStyles.socialButtonIcon}>🍎</Text>
                <Text style={authStyles.socialButtonText}>Continue with Apple</Text>
              </Pressable>

              {/* Google */}
              <Pressable 
                style={({ pressed }) => [authStyles.socialButton, { opacity: pressed ? 0.8 : 1 }]}
                onPress={() => console.log('Google Sign In pressed')}
              >
                <Text style={authStyles.socialButtonIcon}>🌐</Text>
                <Text style={authStyles.socialButtonText}>Continue with Google</Text>
              </Pressable>

              {/* Facebook */}
              <Pressable 
                style={({ pressed }) => [authStyles.socialButton, { opacity: pressed ? 0.8 : 1 }]}
                onPress={() => console.log('Facebook Sign In pressed')}
              >
                <Text style={authStyles.socialButtonIcon}>📘</Text>
                <Text style={authStyles.socialButtonText}>Continue with Facebook</Text>
              </Pressable>

              {/* Guest */}
              <Pressable 
                style={({ pressed }) => [authStyles.socialButton, { opacity: pressed ? 0.8 : 1 }]}
                onPress={() => console.log('Guest Sign In pressed')}
              >
                <Text style={authStyles.socialButtonIcon}>👤</Text>
                <Text style={authStyles.socialButtonText}>Continue as Guest</Text>
              </Pressable>
            </View>

            {/* Sign Up Link */}
            <View style={authStyles.footerContainer}>
              <Text style={authStyles.footerText}>
                Don't have an account?{" "}
              </Text>
              <Pressable onPress={() => router.push('/(auth)/sign-up' as any)}>
                <Text style={authStyles.linkText}>Sign Up</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

