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
import { useSignUp } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, Spacing, FontSize, Radius, THEMES } from '@/src/design';

export default function SignUpScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { signUp, setActive, isLoaded } = useSignUp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = useCallback(async () => {
    if (!isLoaded) return;
    setError(null);
    setLoading(true);
    try {
      const result = await signUp.create({
        firstName: name.trim().split(' ')[0] ?? name.trim(),
        lastName: name.trim().split(' ').slice(1).join(' ') || undefined,
        emailAddress: email.trim(),
        password,
      });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/(tabs)/discover' as any);
      } else {
        // Email verification or other steps may be required
        setError('Please check your email to verify your account.');
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message ?? 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [isLoaded, signUp, name, email, password, setActive, router]);

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
          <Text style={styles.title}>Create your account</Text>
          <Text style={[styles.subtitle, Platform.OS === 'web' && { color: theme.textSecondary }]}>
            Start your music journey today
          </Text>
        </View>

        {/* Fields */}
        <View style={styles.fieldGroup}>
          {/* Name */}
          <TextInput
            style={[styles.input, { backgroundColor: theme.surfaceHigh, borderColor: theme.border, color: theme.textPrimary }]}
            placeholder="Full name"
            placeholderTextColor={theme.textDisabled}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            textContentType="name"
            autoComplete="name"
          />

          {/* Email */}
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
              textContentType="newPassword"
              autoComplete="new-password"
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

          {/* Create account button */}
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
            onPress={handleSignUp}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={theme.textOnPrimary} />
            ) : (
              <Text style={[styles.primaryBtnText, { color: theme.textOnPrimary }]}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Terms */}
          <Text style={[styles.termsText, { color: theme.textDisabled }]}>
            By creating an account, you agree to our Terms & Privacy Policy
          </Text>
        </View>

        {/* Sign in link */}
        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => router.push('/(auth)/sign-in' as any)}
        >
          <Text style={[styles.linkText, { color: theme.textSecondary }]}>
            Already have an account?{' '}
            <Text style={{ color: theme.primary, fontWeight: '600' }}>Sign in →</Text>
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
  termsText: {
    fontSize: FontSize.xs,
    textAlign: 'center',
    lineHeight: 18,
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
