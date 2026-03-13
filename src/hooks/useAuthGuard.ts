import { useAuth } from '@clerk/clerk-expo';
import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

export function useAuthGuard() {
  const { isSignedIn, isLoaded } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';

    // Signed-in users on login/onboarding -> redirect to home
    if (isSignedIn && inAuthGroup) {
      router.replace('/(tabs)/home' as any);
    }
    // Unauthenticated + not on auth: allow guest access (Continue as Guest)
    // Remove the redirect below to require login for tab screens
    // if (!isSignedIn && !inAuthGroup) {
    //   router.replace('/(auth)/login' as any);
    // }
  }, [isSignedIn, isLoaded, segments, router]);
}
