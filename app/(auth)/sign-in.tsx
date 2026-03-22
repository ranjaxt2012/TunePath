import { useSSO } from '@clerk/clerk-expo';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { THEMES } from '@/src/design';

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const { startSSOFlow } = useSSO();
  const router = useRouter();

  const handleSSO = useCallback(
    async (strategy: 'oauth_google' | 'oauth_apple' | 'oauth_facebook') => {
      try {
        const { createdSessionId, setActive } = await startSSOFlow({ strategy });
        if (createdSessionId && setActive) {
          await setActive({ session: createdSessionId });
          // AuthGuard will handle redirect based on hasOnboarded
        }
      } catch {
        // silent fail — user can try again
      }
    },
    [startSSOFlow]
  );

  return (
    <LinearGradient
      colors={THEMES.purple.gradient}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          {/* Logo area */}
          <View style={styles.logoArea}>
            <Text style={styles.logo}>🎵</Text>
            <Text style={styles.appName}>TunePath</Text>
            <Text style={styles.tagline}>Learn music, your way</Text>
          </View>

          {/* Auth buttons */}
          <View style={styles.authCard}>
            <TouchableOpacity
              style={styles.socialBtn}
              onPress={() => handleSSO('oauth_apple')}
              activeOpacity={0.85}
            >
              <Ionicons name="logo-apple" size={20} color="#1f2937" />
              <Text style={styles.socialBtnText}>Continue with Apple</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialBtn}
              onPress={() => handleSSO('oauth_google')}
              activeOpacity={0.85}
            >
              <Ionicons name="logo-google" size={20} color="#1f2937" />
              <Text style={styles.socialBtnText}>Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialBtn}
              onPress={() => handleSSO('oauth_facebook')}
              activeOpacity={0.85}
            >
              <Ionicons name="logo-facebook" size={20} color="#1f2937" />
              <Text style={styles.socialBtnText}>Continue with Facebook</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.terms}>
            By continuing, you agree to our Terms & Privacy Policy
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 32,
  },
  logoArea: {
    alignItems: 'center',
    gap: 8,
  },
  logo: { fontSize: 64 },
  appName: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
  },
  authCard: {
    width: '100%',
    gap: 12,
  },
  socialBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  socialBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  terms: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
});
