import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Platform, ActivityIndicator, KeyboardAvoidingView, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSignUp, useOAuth } from '@clerk/clerk-expo';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, Spacing, FontSize, Radius, THEMES } from '@/src/design';
import { Log } from '@/src/utils/log';

WebBrowser.maybeCompleteAuthSession();

export default function SignUpScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { signUp, setActive, isLoaded } = useSignUp();
  const { startOAuthFlow: googleOAuth } = useOAuth({ strategy: 'oauth_google' });
  const { startOAuthFlow: appleOAuth } = useOAuth({ strategy: 'oauth_apple' });
  const { startOAuthFlow: facebookOAuth } = useOAuth({ strategy: 'oauth_facebook' });

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  const handleOAuth = useCallback(
    async (startFlow: () => Promise<unknown>) => {
      setError('');
      setOauthLoading(true);
      try {
        const out = (await startFlow()) as {
          createdSessionId?: string;
          setActive?: (a: { session: string }) => Promise<void>;
        };
        if (out.createdSessionId && out.setActive) {
          await out.setActive({ session: out.createdSessionId });
          router.replace('/(tabs)/discover');
        }
      } catch (err) {
        Log.auth('OAuth sign-up error', err);
        setError('Sign up failed. Try again.');
      } finally {
        setOauthLoading(false);
      }
    },
    [router]
  );

  const handleSignUp = useCallback(async () => {
    if (!isLoaded || !signUp) return;
    setError('');
    setLoading(true);
    try {
      const result = await signUp.create({
        firstName: name.trim().split(' ')[0],
        lastName: name.trim().split(' ').slice(1).join(' ') || undefined,
        emailAddress: email.trim(),
        password,
      });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/(tabs)/discover');
      } else {
        setError('Please check your email to verify your account.');
      }
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === 'object' &&
        'errors' in err &&
        Array.isArray((err as { errors: { message?: string }[] }).errors)
          ? (err as { errors: { message?: string }[] }).errors[0]?.message
          : undefined;
      setError(msg ?? 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [isLoaded, signUp, name, email, password, setActive, router]);

  const isWeb = Platform.OS === 'web';
  const textColor = isWeb ? theme.textPrimary : theme.textOnPrimary;
  const subtitleColor = isWeb ? theme.textSecondary : theme.textOnPrimary + 'B3';

  const formContent = (
    <View style={styles.form}>
      <Text style={styles.emoji}>🎵</Text>
      <Text style={[styles.appTitle, { color: textColor }]}>TunePath</Text>
      <Text style={[styles.heading, { color: textColor }]}>Create your account</Text>
      <Text style={[styles.subtitle, { color: subtitleColor }]}>Start your music journey</Text>

      <TextInput
        style={[styles.input, { backgroundColor: theme.surfaceHigh, borderColor: theme.border, color: theme.textPrimary }]}
        placeholder="Full Name"
        placeholderTextColor={theme.textDisabled}
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        autoCorrect={false}
      />

      <TextInput
        style={[styles.input, { backgroundColor: theme.surfaceHigh, borderColor: theme.border, color: theme.textPrimary }]}
        placeholder="Email"
        placeholderTextColor={theme.textDisabled}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, styles.passwordInput, { backgroundColor: theme.surfaceHigh, borderColor: theme.border, color: theme.textPrimary }]}
          placeholder="Password"
          placeholderTextColor={theme.textDisabled}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword((p) => !p)}>
          <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={theme.textDisabled} />
        </TouchableOpacity>
      </View>

      {!!error && <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>}

      <TouchableOpacity
        style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
        onPress={handleSignUp}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading
          ? <ActivityIndicator color={theme.textOnPrimary} />
          : <Text style={[styles.primaryBtnText, { color: theme.textOnPrimary }]}>Create Account</Text>
        }
      </TouchableOpacity>

      <View style={styles.dividerRow}>
        <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
        <Text style={[styles.dividerText, { color: theme.textDisabled }]}>or</Text>
        <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
      </View>

      {/* Google */}
      <TouchableOpacity
        style={[styles.oauthBtn, { backgroundColor: theme.primary }]}
        onPress={() => handleOAuth(googleOAuth)}
        disabled={oauthLoading}
        activeOpacity={0.85}
      >
        <Ionicons name="logo-google" size={20} color={theme.textOnPrimary} style={styles.oauthIcon} />
        <Text style={[styles.oauthText, { color: theme.textOnPrimary }]}>Continue with Google</Text>
      </TouchableOpacity>

      {/* Apple — iOS + web (not Android) */}
      {Platform.OS === 'ios' && (
        <TouchableOpacity
          style={[styles.oauthBtn, { backgroundColor: theme.primary }]}
          onPress={() => handleOAuth(appleOAuth)}
          disabled={oauthLoading}
          activeOpacity={0.85}
        >
          <Ionicons name="logo-apple" size={22} color={theme.textOnPrimary} style={styles.oauthIcon} />
          <Text style={[styles.oauthText, { color: theme.textOnPrimary }]}>Continue with Apple</Text>
        </TouchableOpacity>
      )}

      {/* Facebook */}
      <TouchableOpacity
        style={[styles.oauthBtn, { backgroundColor: theme.primary }]}
        onPress={() => handleOAuth(facebookOAuth)}
        disabled={oauthLoading}
        activeOpacity={0.85}
      >
        <Ionicons name="logo-facebook" size={22} color={theme.textOnPrimary} style={styles.oauthIcon} />
        <Text style={[styles.oauthText, { color: theme.textOnPrimary }]}>Continue with Facebook</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')} style={styles.linkBtn}>
        <Text style={[styles.linkText, { color: theme.primary }]}>Already have an account? Sign in →</Text>
      </TouchableOpacity>
    </View>
  );

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.webRoot, { backgroundColor: theme.background }]}>
        <View style={[styles.webCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {formContent}
        </View>
      </View>
    );
  }

  return (
    <LinearGradient colors={[...THEMES.purple.gradient]} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior="padding" style={styles.kav}>
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            {formContent}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  kav: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: Spacing.xl },
  webRoot: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  webCard: { width: 420, borderRadius: Radius.xl, padding: Spacing.xxl, borderWidth: 0.5, marginTop: -60 },
  form: { gap: Spacing.md },
  emoji: { fontSize: 48, textAlign: 'center' },
  appTitle: { fontSize: FontSize.xxl, fontWeight: '700', textAlign: 'center' },
  heading: { fontSize: FontSize.xl, fontWeight: '700', textAlign: 'center' },
  subtitle: { fontSize: FontSize.sm, textAlign: 'center', marginBottom: Spacing.sm },
  input: { borderWidth: 0.5, borderRadius: Radius.md, padding: Spacing.md, fontSize: FontSize.md },
  passwordContainer: { position: 'relative' },
  passwordInput: { paddingRight: Spacing.xxl + Spacing.md },
  eyeBtn: { position: 'absolute', right: Spacing.md, top: 0, bottom: 0, justifyContent: 'center' },
  errorText: { fontSize: FontSize.sm, textAlign: 'center' },
  primaryBtn: { height: 48, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { fontSize: FontSize.md, fontWeight: '700' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginVertical: Spacing.xs },
  dividerLine: { flex: 1, height: 0.5 },
  dividerText: { fontSize: FontSize.sm },
  oauthBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    marginBottom: Spacing.xs,
  },
  oauthIcon: {
    width: 28,
  },
  oauthText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  linkBtn: { alignItems: 'center', paddingVertical: Spacing.sm },
  linkText: { fontSize: FontSize.sm, fontWeight: '500' },
});
