import React, { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@/src/design';
import { tokenCache } from '@/src/utils/tokenCache';
import { setAuthToken } from '@/src/services/api';
import { useAuthStore } from '@/src/store/authStore';

const CLERK_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '';

function AuthGuard() {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const hasOnboarded = useAuthStore((s) => s.hasOnboarded);

  // Sync token to api layer
  useEffect(() => {
    if (!isSignedIn) { setAuthToken(null); return; }
    getToken().then((t) => setAuthToken(t)).catch(() => {});
  }, [isSignedIn, getToken]);

  useEffect(() => {
    if (!isLoaded) return;
    const inAuth = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';
    const inTabs = segments[0] === '(tabs)';

    if (!isSignedIn && !inAuth) {
      router.replace('/(auth)/sign-in' as any);
      return;
    }
    if (isSignedIn && !hasOnboarded && !inOnboarding) {
      router.replace('/onboarding' as any);
      return;
    }
    if (isSignedIn && hasOnboarded && (inAuth || inOnboarding)) {
      router.replace('/(tabs)/discover' as any);
      return;
    }
  }, [isLoaded, isSignedIn, hasOnboarded, segments, router]);

  if (!isLoaded) return null;
  return <Slot />;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ClerkProvider publishableKey={CLERK_KEY} tokenCache={tokenCache}>
          <ThemeProvider>
            <AuthGuard />
          </ThemeProvider>
        </ClerkProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
