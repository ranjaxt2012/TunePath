import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  useTheme,
  STANDARD_THEMES,
  SEASONAL_THEMES,
  THEMES,
  ThemeId,
  Spacing,
  Radius,
  FontSize,
} from '@/src/design';
import { useAuthStore } from '@/src/store/authStore';
import { HoliGradient } from '@/src/design';

const CUSTOM_COLORS = [
  '#EF4444', '#F97316', '#EAB308',
  '#22C55E', '#14B8A6', '#3B82F6',
  '#8B5CF6', '#EC4899', '#64748B',
  '#DC2626', '#EA580C', '#CA8A04',
  '#16A34A', '#0D9488', '#2563EB',
  '#7C3AED', '#DB2777', '#475569',
];

export default function ProfileScreen() {
  const { theme, setTheme, themeId } = useTheme();
  const router = useRouter();
  const { signOut } = useAuth();
  const user = useAuthStore((s) => s.user);
  const trustTier = useAuthStore((s) => s.trustTier);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const [showColorModal, setShowColorModal] = useState(false);

  const displayName = user?.displayName ?? user?.email ?? 'User';
  const initials = displayName.slice(0, 2).toUpperCase();

  const totalMinutes = 0; // TODO: from progressSummary
  const streak = 0;
  const following = 0;
  const lessonsCount = 0;

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/(auth)/sign-in');
    } catch { /* ignore */ }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* User header */}
        <View style={[styles.userHeader, { backgroundColor: theme.surface }]}>
          <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
            <Text style={[styles.avatarText, { color: theme.textOnPrimary }]}>{initials}</Text>
          </View>
          <Text style={[styles.displayName, { color: theme.textPrimary }]}>{displayName}</Text>
          {trustTier !== 'new' && (
            <View style={[
              styles.tierBadge,
              { backgroundColor: trustTier === 'verified' ? theme.primary : theme.surface, borderColor: theme.border, borderWidth: 1 }
            ]}>
              <Text style={[styles.tierText, { color: trustTier === 'verified' ? theme.textOnPrimary : theme.textSecondary }]}>
                {trustTier === 'verified' ? '✓ Verified' : 'Creator'}
              </Text>
            </View>
          )}
          <Text style={[styles.streakText, { color: theme.textSecondary }]}>🔥 {streak} days</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Lessons', value: lessonsCount },
            { label: 'Minutes', value: totalMinutes },
            { label: 'Streak', value: streak },
            { label: 'Following', value: following },
          ].map((s) => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: theme.surface }]}>
              <Text style={[styles.statValue, { color: theme.textPrimary }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Theme section */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>THEME</Text>

          {/* Standard swatches */}
          <View style={styles.swatchRow}>
            {STANDARD_THEMES.map((t) => (
              <TouchableOpacity
                key={t.id}
                onPress={() => setTheme(t.id as ThemeId)}
                style={[
                  styles.swatch,
                  { backgroundColor: t.primary },
                  themeId === t.id && styles.swatchSelected,
                ]}
              />
            ))}
            {/* Custom color */}
            <TouchableOpacity
              onPress={() => setShowColorModal(true)}
              style={[styles.swatch, { backgroundColor: theme.surfaceHigh, borderColor: theme.border, borderWidth: 1 }]}
            >
              <Ionicons name="color-palette-outline" size={16} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Seasonal */}
          {SEASONAL_THEMES.length > 0 && (
            <>
              <Text style={[styles.seasonalLabel, { color: theme.textSecondary }]}>SEASONAL 🎉</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.seasonalRow}>
                {SEASONAL_THEMES.map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => setTheme(t.id as ThemeId)}
                    style={[
                      styles.seasonalCard,
                      { borderColor: themeId === t.id ? theme.primary : 'transparent', borderWidth: 2 }
                    ]}
                  >
                    <View style={[styles.seasonalSwatch, { overflow: 'hidden' }]}>
                      {t.id === 'holi' ? (
                        <HoliGradient />
                      ) : (
                        <LinearGradient
                          colors={t.gradient}
                          style={StyleSheet.absoluteFillObject}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        />
                      )}
                    </View>
                    <Text style={[styles.seasonalEmoji]}>{t.seasonalEmoji ?? '🎉'}</Text>
                    <Text style={[styles.seasonalCardLabel, { color: theme.textSecondary }]}>{t.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>PREFERENCES</Text>
          <View style={[styles.listCard, { backgroundColor: theme.surface }]}>
            <TouchableOpacity
              style={styles.listRow}
              onPress={() => router.push('/select/instrument' as any)}
            >
              <Text style={[styles.listRowLabel, { color: theme.textPrimary }]}>Instrument</Text>
              <Ionicons name="chevron-forward" size={18} color={theme.textDisabled} />
            </TouchableOpacity>
            <View style={[styles.listDivider, { backgroundColor: theme.border }]} />
            <TouchableOpacity
              style={styles.listRow}
              onPress={() => router.push('/select/level' as any)}
            >
              <Text style={[styles.listRowLabel, { color: theme.textPrimary }]}>Level</Text>
              <Ionicons name="chevron-forward" size={18} color={theme.textDisabled} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>ACCOUNT</Text>
          <View style={[styles.listCard, { backgroundColor: theme.surface }]}>
            {isAdmin && (
              <>
                <TouchableOpacity
                  style={styles.listRow}
                  onPress={() => router.push('/admin' as any)}
                >
                  <Text style={[styles.listRowLabel, { color: theme.textPrimary }]}>Admin Dashboard</Text>
                  <Ionicons name="chevron-forward" size={18} color={theme.textDisabled} />
                </TouchableOpacity>
                <View style={[styles.listDivider, { backgroundColor: theme.border }]} />
              </>
            )}
            <TouchableOpacity style={styles.listRow} onPress={handleSignOut}>
              <Text style={[styles.listRowLabel, { color: theme.error }]}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Custom color modal */}
      <Modal visible={showColorModal} transparent animationType="slide" onRequestClose={() => setShowColorModal(false)}>
        <Pressable style={styles.colorModalBg} onPress={() => setShowColorModal(false)}>
          <View style={[styles.colorSheet, { backgroundColor: theme.modalBg }]}>
            <Text style={[styles.colorSheetTitle, { color: theme.textPrimary }]}>Choose Your Color</Text>
            <View style={styles.colorGrid}>
              {CUSTOM_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[styles.colorDot, { backgroundColor: color }]}
                  onPress={() => {
                    setTheme('custom', { primary: color, primaryLight: color, primaryDark: color });
                    setShowColorModal(false);
                  }}
                />
              ))}
            </View>
            <TouchableOpacity onPress={() => setShowColorModal(false)}>
              <Text style={[styles.colorCancel, { color: theme.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 100 },
  userHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 22, fontWeight: '700' },
  displayName: { fontSize: FontSize.lg, fontWeight: '700' },
  tierBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  tierText: { fontSize: FontSize.xs, fontWeight: '600' },
  streakText: { fontSize: FontSize.sm },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  statCard: {
    flex: 1,
    padding: Spacing.sm,
    borderRadius: Radius.lg,
    alignItems: 'center',
    gap: 2,
  },
  statValue: { fontSize: FontSize.lg, fontWeight: '700' },
  statLabel: { fontSize: FontSize.xs },
  section: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
  },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  swatchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  swatch: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchSelected: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.15 }],
  },
  seasonalLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  seasonalRow: {
    gap: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  seasonalCard: {
    width: 80,
    alignItems: 'center',
    gap: 4,
    borderRadius: Radius.md,
    padding: 4,
  },
  seasonalSwatch: {
    width: 60,
    height: 40,
    borderRadius: Radius.sm,
  },
  seasonalEmoji: { fontSize: 16 },
  seasonalCardLabel: { fontSize: FontSize.xs, textAlign: 'center' },
  listCard: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
  },
  listRowLabel: { fontSize: FontSize.md },
  listDivider: { height: 0.5, marginLeft: Spacing.lg },
  colorModalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  colorSheet: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.xl,
    gap: Spacing.lg,
    alignItems: 'center',
  },
  colorSheetTitle: { fontSize: FontSize.lg, fontWeight: '700' },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    justifyContent: 'center',
  },
  colorDot: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  colorCancel: { fontSize: FontSize.md, paddingVertical: Spacing.sm },
});
