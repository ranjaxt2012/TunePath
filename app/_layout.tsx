import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from '@/src/utils/tokenCache';
import { ThemeProvider } from '@/src/design';
import { useAuthStore } from '@/src/store/authStore';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const CLERK_KEY =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '';

function AuthGuard() {
  const { isSignedIn, isLoaded } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const hasOnboarded = useAuthStore(s => s.hasOnboarded);

  useEffect(() => {
    if (!isLoaded) return;

    const inAuth = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';
    const inTabs = segments[0] === '(tabs)';

    if (!isSignedIn && !inAuth) {
      router.replace('/(auth)/sign-in');
      return;
    }

    if (isSignedIn && !hasOnboarded && !inOnboarding) {
      router.replace('/onboarding');
      return;
    }

    if (isSignedIn && hasOnboarded && (inAuth || inOnboarding)) {
      router.replace('/(tabs)/discover');
      return;
    }
  }, [isSignedIn, isLoaded, hasOnboarded, segments]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ClerkProvider
          publishableKey={CLERK_KEY}
          tokenCache={tokenCache}
        >
          <ThemeProvider>
            <AuthGuard />
          </ThemeProvider>
        </ClerkProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
