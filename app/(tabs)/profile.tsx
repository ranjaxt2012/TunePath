import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, Pressable, Platform, Dimensions } from 'react-native';
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

const SCREEN_HEIGHT = Dimensions.get('window').height;

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
  const [pickedColor, setPickedColor] = useState('#8B5CF6');

  const handleColorComplete = useCallback(({ hex }: { hex: string }) => {
    setPickedColor(hex);
  }, []);

  const handleApplyColor = useCallback(() => {
    setTheme('custom', {
      primary: pickedColor,
      primaryLight: pickedColor + 'CC',
      primaryDark: pickedColor + 'EE',
      gradient: [pickedColor, pickedColor, pickedColor, pickedColor] as any,
    });
    setColorModalVisible(false);
  }, [pickedColor, setTheme]);

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

      {/* Custom color picker modal */}
      <Modal
        visible={colorModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setColorModalVisible(false)}
      >
        <Pressable
          style={[styles.colorModalOverlay, { backgroundColor: theme.overlay }]}
          onPress={() => setColorModalVisible(false)}
        >
          <Pressable
            style={[
              styles.colorModalSheet,
              { backgroundColor: theme.modalBg, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, height: SCREEN_HEIGHT * 0.7 },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.colorModalHandle}>
              <View style={[styles.handleBar, { backgroundColor: theme.border }]} />
            </View>
            <Text style={[styles.colorModalTitle, { color: theme.textPrimary }]}>Pick your color 🎨</Text>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pickerContent}>
              <ColorPicker
                style={styles.colorPicker}
                value={pickedColor}
                onComplete={handleColorComplete}
              >
                <Preview />
                <Panel1 />
                <HueSlider />
                <Swatches />
              </ColorPicker>
            </ScrollView>

            <View style={styles.colorModalActions}>
              <TouchableOpacity
                style={[styles.colorActionBtn, { backgroundColor: theme.surface, borderRadius: Radius.md }]}
                onPress={() => setColorModalVisible(false)}
              >
                <Text style={[styles.colorActionText, { color: theme.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.colorActionBtn, { backgroundColor: pickedColor, borderRadius: Radius.md }]}
                onPress={handleApplyColor}
              >
                <Text style={[styles.colorActionText, { color: '#FFFFFF' }]}>Apply</Text>
              </TouchableOpacity>
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
    justifyContent: 'flex-end',
  },
  colorModalSheet: {
    width: '100%',
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  colorModalHandle: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  colorModalTitle: {
    fontSize: FontSize.xl,
    fontWeight: 'bold',
    marginBottom: Spacing.lg,
  },
  pickerContent: {
    paddingBottom: Spacing.lg,
  },
  colorPicker: {
    width: '100%',
    gap: Spacing.md,
  },
  colorModalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  colorActionBtn: {
    flex: 1,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorActionText: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
});
