/**
 * Navigation Tree
 * ───────────────
 * / (root)
 * ├── (tabs)/
 * │   ├── index (welcome)
 * │   ├── home
 * │   ├── progress
 * │   ├── practice
 * │   └── profile
 * ├── (auth)/
 * │   ├── login
 * │   ├── sign-in
 * │   └── sign-up
 * ├── select/
 * │   ├── instrument
 * │   └── level
 * ├── course/[id]
 * ├── lesson/[id]
 * ├── tutor/upload
 * ├── select-instrument (redirect → select/instrument)
 * └── select-level (redirect → select/level)
 */
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { useFonts } from '@expo-google-fonts/inter/useFonts';
import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { TokenProvider } from '@/src/components/auth/TokenProvider';
import { useAuthGuard } from '@/src/hooks/useAuthGuard';
import { useUserSync } from '@/src/hooks/useUserSync';
import { tokenCache } from '@/src/utils/tokenCache';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
if (!publishableKey) {
  throw new Error('Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in .env.local');
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <TokenProvider>
          <AuthGuardLayout />
        </TokenProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}

function AuthGuardLayout() {
  useAuthGuard();
  useUserSync();
  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen
          name="lesson/[id]"
          options={{
            headerShown: false,
            gestureEnabled: true,
            gestureDirection: 'horizontal',
            fullScreenGestureEnabled: true,
          }}
        />
        <Stack.Screen name="select-instrument" options={{ headerShown: false }} />
        <Stack.Screen name="select-level" options={{ headerShown: false }} />
        <Stack.Screen name="course/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="tutor/upload" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
