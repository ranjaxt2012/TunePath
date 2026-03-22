import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  THEMES,
  STANDARD_THEMES,
  SEASONAL_THEMES,
  ThemeId,
  HoliGradient,
} from '@/src/design';
import { useAuthStore } from '@/src/store/authStore';
import { Avatar } from '@/src/components/ui/Avatar';

const WEB_CONTENT_MAX = 960;

const CUSTOM_COLORS = [
  '#EF4444', '#F97316', '#EAB308',
  '#22C55E', '#14B8A6', '#3B82F6',
  '#8B5CF6', '#EC4899', '#64748B',
  '#DC2626', '#EA580C', '#CA8A04',
  '#16A34A', '#0D9488', '#2563EB',
  '#7C3AED', '#DB2777', '#475569',
];

export default function ProfileScreen() {
  const { theme, themeId, setTheme } = useTheme();
  const router = useRouter();
  const { signOut } = useAuth();
  const {
    user,
    trustTier,
    isAdmin,
    clearUser,
  } = useAuthStore();

  const selectedTheme = themeId;

  const [colorModalVisible, setColorModalVisible] = useState(false);

  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.firstName ?? user?.email ?? 'User';

  const initials =
    user?.firstName && user?.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
      : (user?.firstName?.[0] ?? user?.email?.[0] ?? 'U').toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    clearUser();
    router.replace('/(auth)/sign-in' as any);
  };

  const containerStyle = [
    styles.container,
    Platform.OS === 'web' && styles.webContainer,
  ];

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={containerStyle}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar + identity */}
        <View style={styles.profileHeader}>
          <Avatar name={initials} size={72} />
          <View style={styles.profileInfo}>
            <Text style={[styles.displayName, { color: theme.textPrimary }]}>{displayName}</Text>
            {trustTier === 'verified' && (
              <View style={[styles.tierBadge, { backgroundColor: theme.primary, borderRadius: Radius.full }]}>
                <Text style={[styles.tierText, { color: theme.textOnPrimary }]}>✓ Verified</Text>
              </View>
            )}
            {trustTier === 'trusted' && (
              <View style={[styles.tierBadge, { backgroundColor: theme.surface, borderRadius: Radius.full, borderWidth: 1, borderColor: theme.border }]}>
                <Text style={[styles.tierText, { color: theme.textSecondary }]}>Creator</Text>
              </View>
            )}
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {[
            { label: 'Lessons', value: '0' },
            { label: 'Minutes', value: '0' },
            { label: 'Streak', value: '0' },
            { label: 'Following', value: '0' },
          ].map((stat) => (
            <View key={stat.label} style={[styles.statCard, { backgroundColor: theme.surface, borderRadius: Radius.lg }]}>
              <Text style={[styles.statValue, { color: theme.textPrimary }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Theme section */}
        <View style={[styles.section, { backgroundColor: theme.surface, borderRadius: Radius.lg }]}>
          <Text style={[styles.sectionLabel, { color: theme.textDisabled }]}>THEME</Text>

          {/* Standard swatches */}
          <View style={styles.swatchRow}>
            {STANDARD_THEMES.map((t) => (
              <TouchableOpacity
                key={t.id}
                onPress={() => setTheme(t.id)}
                style={[
                  styles.swatch,
                  { backgroundColor: t.primary, borderRadius: 22 },
                  selectedTheme === t.id && {
                    borderWidth: 3,
                    borderColor: theme.textPrimary,
                    transform: [{ scale: 1.15 }],
                  },
                ]}
              />
            ))}
            <TouchableOpacity
              onPress={() => setColorModalVisible(true)}
              style={[
                styles.swatch,
                {
                  backgroundColor: theme.surfaceHigh,
                  borderRadius: 22,
                  borderWidth: 1,
                  borderColor: theme.border,
                  justifyContent: 'center',
                  alignItems: 'center',
                },
                selectedTheme === 'custom' && {
                  borderWidth: 3,
                  borderColor: theme.textPrimary,
                  transform: [{ scale: 1.15 }],
                },
              ]}
            >
              <Ionicons name="color-palette-outline" size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Seasonal themes */}
          <Text style={[styles.seasonalLabel, { color: theme.textDisabled }]}>SEASONAL 🎉</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.seasonalRow}
          >
            {SEASONAL_THEMES.map((t) => {
              const isActive = selectedTheme === t.id;
              return (
                <TouchableOpacity
                  key={t.id}
                  onPress={() => setTheme(t.id)}
                  style={[
                    styles.seasonalCard,
                    {
                      borderRadius: Radius.lg,
                      borderWidth: isActive ? 2 : 1,
                      borderColor: isActive ? theme.textPrimary : theme.border,
                      overflow: 'hidden',
                    },
                  ]}
                >
                  {t.id === 'holi' ? (
                    <HoliGradient style={styles.seasonalGradient}>
                      <Text style={styles.seasonalEmoji}>{t.seasonalEmoji}</Text>
                      <Text style={[styles.seasonalCardLabel, { color: '#FFFFFF' }]}>{t.label}</Text>
                    </HoliGradient>
                  ) : (
                    <LinearGradient
                      colors={[t.gradient[0], t.gradient[2]]}
                      style={styles.seasonalGradient}
                    >
                      <Text style={styles.seasonalEmoji}>{t.seasonalEmoji}</Text>
                      <Text style={[styles.seasonalCardLabel, { color: '#FFFFFF' }]}>{t.label}</Text>
                    </LinearGradient>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Preferences section */}
        <View style={[styles.section, { backgroundColor: theme.surface, borderRadius: Radius.lg }]}>
          <Text style={[styles.sectionLabel, { color: theme.textDisabled }]}>PREFERENCES</Text>
          <TouchableOpacity
            style={[styles.prefRow, { borderBottomColor: theme.border }]}
            onPress={() => router.push('/select/instrument' as any)}
          >
            <Text style={[styles.prefLabel, { color: theme.textPrimary }]}>Instrument</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.textDisabled} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.prefRow}
            onPress={() => router.push('/select/level' as any)}
          >
            <Text style={[styles.prefLabel, { color: theme.textPrimary }]}>Level</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.textDisabled} />
          </TouchableOpacity>
        </View>

        {/* Account section */}
        <View style={[styles.section, { backgroundColor: theme.surface, borderRadius: Radius.lg }]}>
          <Text style={[styles.sectionLabel, { color: theme.textDisabled }]}>ACCOUNT</Text>
          {isAdmin && (
            <TouchableOpacity
              style={[styles.prefRow, { borderBottomColor: theme.border }]}
              onPress={() => router.push('/admin' as any)}
            >
              <Text style={[styles.prefLabel, { color: theme.textPrimary }]}>Admin Dashboard</Text>
              <Ionicons name="chevron-forward" size={18} color={theme.textDisabled} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.prefRow} onPress={handleSignOut}>
            <Text style={[styles.prefLabel, { color: theme.error }]}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Custom color modal */}
      <Modal
        visible={colorModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setColorModalVisible(false)}
      >
        <Pressable
          style={[styles.colorModalOverlay, { backgroundColor: theme.overlay }]}
          onPress={() => setColorModalVisible(false)}
        >
          <Pressable
            style={[styles.colorModalSheet, { backgroundColor: theme.modalBg, borderRadius: Radius.xl }]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={[styles.colorModalTitle, { color: theme.textPrimary }]}>Custom Color</Text>
            <View style={styles.colorGrid}>
              {CUSTOM_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: color, borderRadius: Radius.md },
                    THEMES.custom.primary === color &&
                      selectedTheme === 'custom' && {
                        borderWidth: 3,
                        borderColor: theme.textPrimary,
                      },
                  ]}
                  onPress={() => {
                    // In a real impl, we'd mutate the custom theme primary color here
                    setTheme('custom');
                    setColorModalVisible(false);
                  }}
                />
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.lg,
  },
  webContainer: {
    maxWidth: WEB_CONTENT_MAX,
    alignSelf: 'center',
    width: '100%',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  profileInfo: {
    flex: 1,
    gap: Spacing.sm,
  },
  displayName: {
    fontSize: FontSize.xl,
    fontWeight: 'bold',
  },
  tierBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  tierText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statValue: {
    fontSize: FontSize.xl,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: FontSize.xs,
  },
  section: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  sectionLabel: {
    fontSize: FontSize.xs,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  swatchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  swatch: {
    width: 44,
    height: 44,
  },
  seasonalLabel: {
    fontSize: FontSize.xs,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginTop: Spacing.sm,
  },
  seasonalRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingRight: Spacing.lg,
  },
  seasonalCard: {
    width: 80,
    height: 80,
    overflow: 'hidden',
  },
  seasonalGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  seasonalEmoji: {
    fontSize: FontSize.xl,
  },
  seasonalCardLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 0,
  },
  prefLabel: {
    fontSize: FontSize.md,
  },
  colorModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  colorModalSheet: {
    width: '100%',
    maxWidth: 360,
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  colorModalTitle: {
    fontSize: FontSize.xl,
    fontWeight: 'bold',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  colorSwatch: {
    width: 44,
    height: 44,
  },
});
