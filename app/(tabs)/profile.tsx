import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, Platform } from 'react-native';
import ColorPicker, { Panel1, Swatches, Preview, HueSlider } from 'reanimated-color-picker';
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
  STANDARD_THEMES,
  SEASONAL_THEMES,
  HoliGradient,
} from '@/src/design';
import { useAuthStore } from '@/src/store/authStore';
import { Avatar } from '@/src/components/ui/Avatar';

const WEB_CONTENT_MAX = 960;

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

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedHex, setSelectedHex] = useState(theme.primary);

  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.firstName ?? user?.email ?? 'User';

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
          <Avatar name={displayName} size={72} />
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
              onPress={() => { setSelectedHex(theme.primary); setShowColorPicker(true); }}
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
                      <Text style={[styles.seasonalCardLabel, { color: theme.textOnPrimary }]}>{t.label}</Text>
                    </HoliGradient>
                  ) : (
                    <LinearGradient
                      colors={[t.gradient[0], t.gradient[2]]}
                      style={styles.seasonalGradient}
                    >
                      <Text style={styles.seasonalEmoji}>{t.seasonalEmoji}</Text>
                      <Text style={[styles.seasonalCardLabel, { color: theme.textOnPrimary }]}>{t.label}</Text>
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

      {/* Color picker modal */}
      <Modal
        visible={showColorPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowColorPicker(false)}
      >
        <View style={[styles.pickerOverlay, { backgroundColor: theme.overlay }]}>
          <View style={[styles.pickerSheet, { backgroundColor: theme.modalBg }]}>
            <View style={[styles.handle, { backgroundColor: theme.border }]} />
            <Text style={[styles.pickerTitle, { color: theme.textPrimary }]}>
              🎨 Pick your color
            </Text>

            <ColorPicker
              style={{ width: '100%' }}
              value={selectedHex}
              onComplete={({ hex }) => setSelectedHex(hex)}
            >
              <Preview
                style={{
                  height: 52,
                  borderRadius: Radius.md,
                  marginBottom: Spacing.md,
                }}
              />
              <Panel1
                style={{
                  height: 160,
                  borderRadius: Radius.md,
                  marginBottom: Spacing.md,
                }}
              />
              <HueSlider
                style={{
                  borderRadius: Radius.full,
                  marginBottom: Spacing.md,
                }}
              />
              <Swatches
                style={{ marginBottom: Spacing.lg }}
                swatchStyle={{
                  borderRadius: Radius.full,
                  width: 28,
                  height: 28,
                }}
                colors={Array.from(
                  new Set(
                    [...STANDARD_THEMES, ...SEASONAL_THEMES].map((t) => t.primary)
                  )
                )}
              />
            </ColorPicker>

            <View style={styles.pickerBtns}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: theme.border }]}
                onPress={() => setShowColorPicker(false)}
              >
                <Text style={{ color: theme.textSecondary, fontSize: FontSize.md }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.applyBtn, { backgroundColor: selectedHex }]}
                onPress={() => {
                  setTheme('custom', {
                    primary: selectedHex,
                    primaryLight: selectedHex,
                    primaryDark: selectedHex,
                    gradient: [selectedHex, selectedHex, selectedHex, selectedHex] as [
                      string,
                      string,
                      string,
                      string,
                    ],
                  });
                  setShowColorPicker(false);
                }}
              >
                <Text style={{ color: theme.textOnPrimary, fontSize: FontSize.md, fontWeight: '700' }}>
                  Apply →
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  pickerOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  handle: {
    width: Spacing.xxxl - Spacing.md,
    height: Spacing.xs,
    borderRadius: Radius.sm,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  pickerTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  pickerBtns: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    alignItems: 'center',
  },
  applyBtn: {
    flex: 2,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    alignItems: 'center',
  },
});
