import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { profileStyles } from '../../src/styles/profileStyles';

// Settings Item Component
function SettingsItem({ icon, label, value, onPress }: { icon: string; label: string; value?: string; onPress?: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [profileStyles.settingsItem, { opacity: pressed ? 0.8 : 1 }]}
      onPress={onPress}
    >
      <View style={profileStyles.settingsItemLeft}>
        <Text style={profileStyles.settingsItemIcon}>{icon}</Text>
        <Text style={profileStyles.settingsItemLabel}>{label}</Text>
      </View>
      <View style={profileStyles.settingsItemRight}>
        {value && (
          <Text style={profileStyles.settingsItemValue}>{value}</Text>
        )}
        <Text style={profileStyles.chevron}>›</Text>
      </View>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <View style={profileStyles.container}>
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
            <Text style={profileStyles.avatarIcon}>👤</Text>
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
              icon="🎵"
              label="Change Instrument"
              value="Harmonium"
            />
            <View style={profileStyles.divider} />
            <SettingsItem
              icon="📊"
              label="Change Level"
              value="Beginner"
            />
            <View style={profileStyles.divider} />
            <SettingsItem
              icon="🔔"
              label="Notification Settings"
            />
            <View style={profileStyles.divider} />
            <SettingsItem
              icon="⚙️"
              label="App Preferences"
            />
          </View>
        </View>

        {/* Account Section */}
        <View style={profileStyles.section}>
          <Text style={profileStyles.sectionTitle}>Account</Text>
          <View style={profileStyles.sectionCard}>
            <SettingsItem
              icon="💳"
              label="Manage Subscription"
            />
            <View style={profileStyles.divider} />
            <SettingsItem
              icon="🛡️"
              label="Privacy Policy"
            />
            <View style={profileStyles.divider} />
            <SettingsItem
              icon="🚪"
              label="Log Out"
              onPress={() => console.log('Log Out pressed')}
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Tab Bar */}
      <View style={profileStyles.bottomTabBar}>
        <View style={profileStyles.tabBarContent}>
          {/* Home Tab */}
          <Pressable 
            style={profileStyles.tabButton}
            onPress={() => router.push('/home')}
          >
            <Text style={profileStyles.tabIconInactive}>🏠</Text>
            <Text style={profileStyles.tabTextInactive}>Home</Text>
          </Pressable>

          {/* Practice Tab */}
          <Pressable 
            style={profileStyles.tabButton}
            onPress={() => router.push('/practice')}
          >
            <Text style={profileStyles.tabIconInactive}>🎵</Text>
            <Text style={profileStyles.tabTextInactive}>Practice</Text>
          </Pressable>

          {/* Progress Tab */}
          <Pressable 
            style={profileStyles.tabButton}
            onPress={() => router.push('/progress')}
          >
            <Text style={profileStyles.tabIconInactive}>📊</Text>
            <Text style={profileStyles.tabTextInactive}>Progress</Text>
          </Pressable>

          {/* Profile Tab - Active */}
          <Pressable 
            style={profileStyles.tabButton}
            onPress={() => console.log('Already on Profile')}
          >
            <Text style={profileStyles.tabIconActive}>👤</Text>
            <Text style={profileStyles.tabTextActive}>Profile</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
