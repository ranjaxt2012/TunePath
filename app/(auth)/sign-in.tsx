import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSignIn, useOAuth } from '@clerk/clerk-expo';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, Spacing, FontSize, Radius, THEMES } from '@/src/design';

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { signIn, setActive, isLoaded } = useSignIn();
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = useCallback(async () => {
    if (!isLoaded) return;
    setError(null);
    setLoading(true);
    try {
      const result = await signIn.create({
        identifier: email.trim(),
        password,
      });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/(tabs)/discover' as any);
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message ?? 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [isLoaded, signIn, email, password, setActive, router]);

  const handleGoogle = useCallback(async () => {
    try {
      const { createdSessionId, setActive: activate } = await startOAuthFlow();
      if (createdSessionId && activate) {
        await activate({ session: createdSessionId });
        router.replace('/(tabs)/discover' as any);
      }
    } catch {
      setError('Google sign-in failed. Please try again.');
    }
  }, [startOAuthFlow, router]);

  const formContent = (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: Platform.OS === 'web' ? 0 : 1 }}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoArea}>
          <Text style={styles.logoEmoji}>🎵</Text>
          <Text style={[styles.appName, Platform.OS === 'web' && { color: theme.textPrimary }]}>
            TunePath
          </Text>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={[styles.subtitle, Platform.OS === 'web' && { color: theme.textSecondary }]}>
            Sign in to continue learning
          </Text>
        </View>

        {/* Email */}
        <View style={styles.fieldGroup}>
          <TextInput
            style={[styles.input, { backgroundColor: theme.surfaceHigh, borderColor: theme.border, color: theme.textPrimary }]}
            placeholder="Email"
            placeholderTextColor={theme.textDisabled}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
            autoComplete="email"
          />

          {/* Password */}
          <View>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surfaceHigh, borderColor: theme.border, color: theme.textPrimary }]}
              placeholder="Password"
              placeholderTextColor={theme.textDisabled}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              textContentType="password"
              autoComplete="password"
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowPassword((v) => !v)}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={theme.textDisabled}
              />
            </TouchableOpacity>
          </View>

          {/* Error */}
          {error && (
            <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
          )}

          {/* Sign in button */}
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
            onPress={handleSignIn}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={theme.textOnPrimary} />
            ) : (
              <Text style={[styles.primaryBtnText, { color: theme.textOnPrimary }]}>Sign in</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
            <Text style={[styles.dividerText, { color: theme.textDisabled }]}>or</Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
          </View>

          {/* Google */}
          <TouchableOpacity
            style={[styles.googleBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={handleGoogle}
            activeOpacity={0.85}
          >
            <Ionicons name="logo-google" size={18} color={theme.textPrimary} />
            <Text style={[styles.googleBtnText, { color: theme.textPrimary }]}>Continue with Google</Text>
          </TouchableOpacity>
        </View>

        {/* Sign up link */}
        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => router.push('/(auth)/sign-up' as any)}
        >
          <Text style={[styles.linkText, { color: theme.textSecondary }]}>
            Don't have an account?{' '}
            <Text style={{ color: theme.primary, fontWeight: '600' }}>Sign up →</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.webContainer, { backgroundColor: theme.background }]}>
        <View style={[styles.webCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {formContent}
        </View>
      </View>
    );
  }

  return (
    <LinearGradient colors={THEMES.purple.gradient} style={styles.gradient}>
      <SafeAreaView style={{ flex: 1 }}>
        {formContent}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  webContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh' as any,
  },
  webCard: {
    width: 420,
    borderRadius: Radius.xl,
    borderWidth: 0.5,
    padding: Spacing.xxl,
    marginTop: -60,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
    gap: Spacing.lg,
  },
  logoArea: {
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  logoEmoji: { fontSize: 48 },
  appName: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  fieldGroup: {
    gap: Spacing.md,
  },
  input: {
    borderWidth: 0.5,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
  },
  eyeBtn: {
    position: 'absolute',
    right: Spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  errorText: {
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
  primaryBtn: {
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
  },
  primaryBtnText: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 0.5,
  },
  dividerText: {
    fontSize: FontSize.sm,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    height: 48,
  },
  googleBtnText: {
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  linkRow: {
    alignItems: 'center',
    paddingTop: Spacing.sm,
  },
  linkText: {
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
});
