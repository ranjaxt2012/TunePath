import { useSSO } from '@clerk/clerk-expo';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const { startSSOFlow } = useSSO();
  const router = useRouter();

  const handleSSO = useCallback(
    async (strategy: 'oauth_google' | 'oauth_apple' | 'oauth_facebook') => {
      try {
        const { createdSessionId, setActive } = await startSSOFlow({ strategy });
        if (createdSessionId && setActive) {
          await setActive({ session: createdSessionId });
          router.replace('/(tabs)/home' as any);
        }
      } catch (err) {
        console.error('SSO error', err);
      }
    },
    [startSSOFlow, router]
  );

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome to TunePath</Text>
        <Text style={styles.subtitle}>Sign in to continue your practice.</Text>

        <TouchableOpacity style={styles.socialButton} onPress={() => handleSSO('oauth_apple')}>
          <Text style={styles.socialButtonText}>Continue with Apple</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialButton} onPress={() => handleSSO('oauth_google')}>
          <Text style={styles.socialButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialButton} onPress={() => handleSSO('oauth_facebook')}>
          <Text style={styles.socialButtonText}>Continue with Facebook</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.guestButton} onPress={() => router.replace('/(tabs)/home' as any)}>
          <Text style={styles.guestButtonText}>Continue as Guest</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 28,
    width: '100%',
    gap: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#DDD6FE',
    textAlign: 'center',
    marginBottom: 16,
  },
  socialButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    paddingVertical: 14,
    alignItems: 'center',
  },
  socialButtonText: {
    color: '#6B46C1',
    fontWeight: '600',
    fontSize: 15,
  },
  guestButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 50,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  guestButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 15,
  },
});
