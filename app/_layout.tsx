import React, { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { ClerkProvider, useAuth, useUser } from '@clerk/clerk-expo';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@/src/design';
import { tokenCache } from '@/src/utils/tokenCache';
import { setAuthToken, setRefreshToken, api } from '@/src/services/api';
import { useAuthStore } from '@/src/store/authStore';
import { Log } from '@/src/utils/log';

const CLERK_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '';

function AuthGuard() {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const segments = useSegments();
  const hasOnboarded = useAuthStore((s) => s.hasOnboarded);
  const hasRedirected = useRef(false);
  const prevAuthRef = useRef({ isSignedIn, hasOnboarded });

  // Sync token to api layer — only runs when auth changes
  useEffect(() => {
    if (!isSignedIn) {
      setAuthToken(null);
      useAuthStore.getState().setDbUserId(null);
      return;
    }
    setRefreshToken(async () => {
      try {
        return await getToken({ skipCache: true });
      } catch {
        return null;
      }
    });
    let cancelled = false;
    getToken()
      .then(async (token) => {
        if (cancelled) return;
        setAuthToken(token);
        try {
          const syncResult = await api.post('/api/auth/sync', {
            clerkUserId: user?.id ?? '',
            email: user?.primaryEmailAddress?.emailAddress ?? '',
            displayName:
              user?.fullName ??
              (`${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() ||
                (user?.primaryEmailAddress?.emailAddress ?? '')),
            avatarUrl: user?.imageUrl ?? null,
          });
          useAuthStore.getState().setDbUserId((syncResult as any)?.id ?? null);
        } catch (err) {
          Log.auth('sync failed', err);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- only run when auth changes
  }, [isSignedIn]);

  useEffect(() => {
    if (!isLoaded) return;
    // Reset redirect guard when auth state changes (e.g. sign out -> redirect to sign-in)
    if (prevAuthRef.current.isSignedIn !== isSignedIn || prevAuthRef.current.hasOnboarded !== hasOnboarded) {
      prevAuthRef.current = { isSignedIn, hasOnboarded };
      hasRedirected.current = false;
    }
    if (hasRedirected.current) return;

    const inAuth = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';

    if (!isSignedIn && !inAuth) {
      hasRedirected.current = true;
      Log.nav('redirecting to', { target: '/(auth)/sign-in' });
      router.replace('/(auth)/sign-in' as any);
      return;
    }

    if (isSignedIn && !hasOnboarded && !inOnboarding) {
      hasRedirected.current = true;
      Log.nav('redirecting to', { target: '/onboarding' });
      router.replace('/onboarding' as any);
      return;
    }

    if (isSignedIn && hasOnboarded && (inAuth || inOnboarding)) {
      hasRedirected.current = true;
      Log.nav('redirecting to', { target: '/(tabs)/discover' });
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
        <ClerkProvider
          publishableKey={CLERK_KEY}
          tokenCache={Platform.OS === 'web' ? undefined : tokenCache}
        >
          <ThemeProvider>
            <AuthGuard />
          </ThemeProvider>
        </ClerkProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
