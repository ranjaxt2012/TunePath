import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { BottomTabBar } from '../../src/components/ui';
import { ScreenGradient } from '@/src/components/common/ScreenGradient';
import { createProfileStyles } from '../../src/styles/profileStyles';
import { useTheme, THEMES, type ThemeId } from '@/src/contexts/ThemeContext';
import { useAuthStore } from '@/src/store/authStore';
import { useOrientation } from '@/src/hooks/useOrientation';

type IconName = ComponentProps<typeof Ionicons>['name'];

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const selectedInstrument = useAuthStore((s) => s.selectedInstrumentSlug);
  const selectedLevel = useAuthStore((s) => s.selectedLevelSlug);
  const genres = useAuthStore((s) => s.selectedGenres);
  const { isLandscape } = useOrientation();
  const profileStyles = createProfileStyles(theme);

  const SettingsItem = React.memo(function SettingsItem({
    icon,
    label,
    value,
    onPress,
  }: {
    icon: IconName;
    label: string;
    value?: string;
    onPress?: () => void;
  }) {
    return (
      <Pressable
        style={({ pressed }) => [
          profileStyles.settingsItem,
          { opacity: pressed ? 0.8 : 1 },
        ]}
        onPress={onPress}
      >
        <View style={profileStyles.settingsItemLeft}>
          <Ionicons
            name={icon}
            size={20}
            color="#FFFFFF"
            style={profileStyles.settingsItemIcon}
          />
          <Text style={profileStyles.settingsItemLabel}>{label}</Text>
        </View>
        <View style={profileStyles.settingsItemRight}>
          {value && <Text style={profileStyles.settingsItemValue}>{value}</Text>}
          <Ionicons
            name="chevron-forward"
            size={20}
            color="rgba(255,255,255,0.75)"
          />
        </View>
      </Pressable>
    );
  });

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (e) {
      console.error('Sign out failed:', e);
    }
  };

  return (
    <ScreenGradient style={profileStyles.container}>
      {/* Header */}
      <View style={[profileStyles.headerContainer, isLandscape && { paddingHorizontal: 16 }]}>
        <Text style={profileStyles.title}>Profile</Text>
      </View>

      {/* Main Content */}
      {isLandscape ? (
        <View style={{ flex: 1, flexDirection: 'row', paddingTop: 16 }}>
          {/* Left Column */}
          <ScrollView style={{ flex: 0.4, paddingRight: 8 }} showsVerticalScrollIndicator={false}>
            {/* User Info Card */}
            <View style={profileStyles.userInfoCard}>
              {/* Avatar */}
              <View style={profileStyles.avatar}>
                <Ionicons name="person" size={48} color="#FFFFFF" />
              </View>

              {/* User Details */}
              <Text style={profileStyles.userName}>{user?.displayName || 'User'}</Text>
              {user?.email && (
                <Text style={profileStyles.userLevel}>{user.email}</Text>
              )}
            </View>

            {/* Learning Section */}
            <View style={profileStyles.section}>
              <Text style={profileStyles.sectionTitle}>Learning</Text>
              <View style={profileStyles.sectionCard}>
                <SettingsItem
                  icon="musical-notes"
                  label="Instrument"
                  value={selectedInstrument || 'Select'}
                  onPress={() => router.push('/select/instrument')}
                />
                <View style={profileStyles.divider} />
                <SettingsItem
                  icon="bar-chart"
                  label="Level"
                  value={selectedLevel || 'Select'}
                  onPress={() => router.push('/select/level')}
                />
              </View>
            </View>
          </ScrollView>

          {/* Right Column */}
          <ScrollView style={{ flex: 0.6, paddingLeft: 8 }} showsVerticalScrollIndicator={false}>
            {/* Theme Picker Section */}
            <View style={profileStyles.section}>
              <Text style={profileStyles.sectionTitle}>Theme</Text>
              <View style={profileStyles.themesContainer}>
                <View style={profileStyles.themesGrid}>
                  {Object.values(THEMES).map((t) => (
                    <Pressable
                      key={t.id}
                      onPress={() => setTheme(t.id as ThemeId)}
                      style={{ alignItems: 'center' }}
                    >
                      <View
                        style={[
                          profileStyles.themeSwatch,
                          { backgroundColor: t.bgPrimary },
                          theme.id === t.id && profileStyles.themeSwatchActive,
                        ]}
                      >
                        {theme.id === t.id && (
                          <Ionicons name="checkmark" size={24} color="#FFFFFF" />
                        )}
                      </View>
                      <Text style={profileStyles.themeLabel}>{t.label}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>

            {/* Genres Section */}
            {genres && genres.length > 0 && (
              <View style={profileStyles.section}>
                <Text style={profileStyles.sectionTitle}>Preferred Genres</Text>
                <View style={profileStyles.genresContainer}>
                  {genres.map((genre) => (
                    <View key={genre} style={profileStyles.genresPill}>
                      <Text style={profileStyles.genresPillText}>{genre}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Sign Out */}
            <Pressable
              style={({ pressed }) => [
                profileStyles.settingsItem,
                { marginTop: 16, opacity: pressed ? 0.8 : 1 },
              ]}
              onPress={handleSignOut}
            >
              <View style={profileStyles.settingsItemLeft}>
                <Ionicons name="log-out" size={20} color="#FF6B6B" />
                <Text style={[profileStyles.settingsItemLabel, { color: '#FF6B6B' }]}>Sign Out</Text>
              </View>
            </Pressable>
          </ScrollView>
        </View>
      ) : (
        <ScrollView
          style={profileStyles.mainContent}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
        {/* User Info Card */}
        <View style={profileStyles.userInfoCard}>
          {/* Avatar */}
          <View style={profileStyles.avatar}>
            <Ionicons name="person" size={48} color="#FFFFFF" />
          </View>

          {/* User Details */}
          <Text style={profileStyles.userName}>{user?.displayName || 'User'}</Text>
          {user?.email && (
            <Text style={profileStyles.userLevel}>{user.email}</Text>
          )}
        </View>

        {/* Learning Section */}
        <View style={profileStyles.section}>
          <Text style={profileStyles.sectionTitle}>Learning</Text>
          <View style={profileStyles.sectionCard}>
            <SettingsItem
              icon="musical-notes"
              label="Instrument"
              value={selectedInstrument || 'Select'}
              onPress={() => router.push('/select/instrument')}
            />
            <View style={profileStyles.divider} />
            <SettingsItem
              icon="bar-chart"
              label="Level"
              value={selectedLevel || 'Select'}
              onPress={() => router.push('/select/level')}
            />
          </View>
        </View>

        {/* Theme Picker Section */}
        <View style={profileStyles.section}>
          <Text style={profileStyles.sectionTitle}>Theme</Text>
          <View style={profileStyles.themesContainer}>
            <View style={profileStyles.themesGrid}>
              {Object.values(THEMES).map((t) => (
                <Pressable
                  key={t.id}
                  onPress={() => setTheme(t.id as ThemeId)}
                  style={{ alignItems: 'center' }}
                >
                  <View
                    style={[
                      profileStyles.themeSwatch,
                      { backgroundColor: t.bgPrimary },
                      theme.id === t.id && profileStyles.themeSwatchActive,
                    ]}
                  >
                    {theme.id === t.id && (
                      <Ionicons name="checkmark" size={24} color="#FFFFFF" />
                    )}
                  </View>
                  <Text style={profileStyles.themeLabel}>{t.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Genres Section */}
        {genres && genres.length > 0 && (
          <View style={profileStyles.section}>
            <Text style={profileStyles.sectionTitle}>Preferred Genres</Text>
            <View style={profileStyles.genresContainer}>
              {genres.map((genre) => (
                <View key={genre} style={profileStyles.genresPill}>
                  <Text style={profileStyles.genresPillText}>{genre}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Tutor Portal */}
        <View style={profileStyles.section}>
          <Pressable
            style={profileStyles.settingsItem}
            onPress={() => router.push('/tutor/upload')}
          >
            <View style={profileStyles.settingsItemLeft}>
              <Ionicons
                name="cloud-upload-outline"
                size={20}
                color="#FFFFFF"
              />
              <Text style={profileStyles.settingsItemLabel}>Tutor Portal</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color="rgba(255,255,255,0.75)"
            />
          </Pressable>
        </View>

        {/* Sign Out Button */}
        <Pressable
          onPress={handleSignOut}
          style={({ pressed }) => [
            profileStyles.signOutButton,
            { opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Text style={profileStyles.signOutButtonText}>Sign Out</Text>
        </Pressable>
        </ScrollView>
      )}

      <BottomTabBar activeTab="profile" />
    </ScreenGradient>
  );
}
