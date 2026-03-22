import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Platform, ActivityIndicator, KeyboardAvoidingView, ScrollView,
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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  const handleSignIn = useCallback(async () => {
    if (!isLoaded || !signIn) return;
    setError('');
    setLoading(true);
    try {
      const result = await signIn.create({ identifier: email.trim(), password });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/(tabs)/discover' as any);
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.message ?? 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [isLoaded, signIn, email, password, setActive, router]);

  const handleGoogleOAuth = useCallback(async () => {
    setError('');
    setOauthLoading(true);
    try {
      const { createdSessionId, setActive: sa } = await startOAuthFlow();
      if (createdSessionId && sa) {
        await sa({ session: createdSessionId });
        router.replace('/(tabs)/discover' as any);
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.message ?? 'Google sign in failed. Please try again.');
    } finally {
      setOauthLoading(false);
    }
  }, [startOAuthFlow, router]);

  const formContent = (
    <View style={styles.form}>
      <Text style={styles.emoji}>🎵</Text>
      <Text style={[styles.appTitle, { color: Platform.OS === 'web' ? theme.textPrimary : '#FFFFFF' }]}>TunePath</Text>
      <Text style={[styles.heading, { color: Platform.OS === 'web' ? theme.textPrimary : '#FFFFFF' }]}>Welcome back</Text>
      <Text style={[styles.subtitle, { color: Platform.OS === 'web' ? theme.textSecondary : 'rgba(255,255,255,0.7)' }]}>Sign in to continue learning</Text>

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
        onPress={handleSignIn}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading
          ? <ActivityIndicator color={theme.textOnPrimary} />
          : <Text style={[styles.primaryBtnText, { color: theme.textOnPrimary }]}>Sign in</Text>
        }
      </TouchableOpacity>

      <View style={styles.dividerRow}>
        <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
        <Text style={[styles.dividerText, { color: theme.textDisabled }]}>or</Text>
        <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
      </View>

      <TouchableOpacity
        style={[styles.oauthBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
        onPress={handleGoogleOAuth}
        disabled={oauthLoading}
        activeOpacity={0.85}
      >
        {oauthLoading
          ? <ActivityIndicator color={theme.textPrimary} />
          : (
            <>
              <Ionicons name="logo-google" size={18} color={theme.textPrimary} />
              <Text style={[styles.oauthBtnText, { color: theme.textPrimary }]}>Continue with Google</Text>
            </>
          )
        }
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/(auth)/sign-up' as any)} style={styles.linkBtn}>
        <Text style={[styles.linkText, { color: theme.primary }]}>Don't have an account? Sign up →</Text>
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
    <LinearGradient colors={THEMES.purple.gradient as any} style={styles.gradient}>
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
  oauthBtn: { height: 48, borderRadius: Radius.lg, borderWidth: 0.5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  oauthBtnText: { fontSize: FontSize.md, fontWeight: '500' },
  linkBtn: { alignItems: 'center', paddingVertical: Spacing.sm },
  linkText: { fontSize: FontSize.sm, fontWeight: '500' },
});
