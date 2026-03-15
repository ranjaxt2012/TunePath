import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { BottomTabBar } from '../../src/components/ui';
import { ScreenGradient } from '@/src/components/common/ScreenGradient';
import { Colors } from '@/src/constants/theme';
import { profileStyles } from '../../src/styles/profileStyles';

type IconName = ComponentProps<typeof Ionicons>['name'];

const SettingsItem = React.memo(function SettingsItem({ icon, label, value, onPress }: { icon: IconName; label: string; value?: string; onPress?: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [profileStyles.settingsItem, { opacity: pressed ? 0.8 : 1 }]}
      onPress={onPress}
    >
      <View style={profileStyles.settingsItemLeft}>
        <Ionicons name={icon} size={20} color={Colors.textPrimary} style={profileStyles.settingsItemIcon} />
        <Text style={profileStyles.settingsItemLabel}>{label}</Text>
      </View>
      <View style={profileStyles.settingsItemRight}>
        {value && (
          <Text style={profileStyles.settingsItemValue}>{value}</Text>
        )}
        <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
      </View>
    </Pressable>
  );
});

export default function ProfileScreen() {
  return (
    <ScreenGradient style={profileStyles.container}>
      {/* Header */}
      <View style={profileStyles.headerContainer}>
        <Text style={profileStyles.title}>Profile</Text>
      </View>

      {/* Main Content */}
      <ScrollView style={profileStyles.mainContent} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* User Info Card */}
        <View style={profileStyles.userInfoCard}>
          {/* Avatar */}
          <View style={profileStyles.avatar}>
            <Ionicons name="person" size={48} color={Colors.textPrimary} />
          </View>
          
          {/* User Details */}
          <Text style={profileStyles.userName}>Sarah Johnson</Text>
          <Text style={profileStyles.userInstrument}>Harmonium</Text>
          <Text style={profileStyles.userLevel}>Beginner Level</Text>
        </View>

        {/* Settings Section */}
        <View style={profileStyles.section}>
          <Text style={profileStyles.sectionTitle}>Settings</Text>
          <View style={profileStyles.sectionCard}>
            <SettingsItem
              icon="musical-notes"
              label="Change Instrument"
              value="Harmonium"
            />
            <View style={profileStyles.divider} />
            <SettingsItem
              icon="bar-chart"
              label="Change Level"
              value="Beginner"
            />
            <View style={profileStyles.divider} />
            <SettingsItem
              icon="notifications-outline"
              label="Notification Settings"
            />
            <View style={profileStyles.divider} />
            <SettingsItem
              icon="settings-outline"
              label="App Preferences"
            />
          </View>
        </View>

        {/* Account Section */}
        <View style={profileStyles.section}>
          <Text style={profileStyles.sectionTitle}>Account</Text>
          <View style={profileStyles.sectionCard}>
            <SettingsItem
              icon="card-outline"
              label="Manage Subscription"
            />
            <View style={profileStyles.divider} />
            <SettingsItem
              icon="shield-checkmark-outline"
              label="Privacy Policy"
            />
            <View style={profileStyles.divider} />
            <SettingsItem
              icon="log-out-outline"
              label="Log Out"
              onPress={() => { /* TODO: implement logout */ }}
            />
          </View>
        </View>
      </ScrollView>

      <BottomTabBar activeTab="profile" />
    </ScreenGradient>
  );
}
