import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  
  const handleChangeInstrument = () => {
    router.push('/select-instrument' as any);
  };

  const handleChangeLevel = () => {
    router.push('/select-level' as any);
  };

  const handleNotificationSettings = () => {
    // Navigate to notification settings
  };

  return (
    <View style={styles.container}>
      {/* Background */}
      <View style={styles.background}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>SJ</Text>
            </View>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Sarah Johnson</Text>
            <Text style={styles.profileInstrument}>Harmonium</Text>
            <Text style={styles.profileLevel}>Beginner Level</Text>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          {/* Change Instrument */}
          <View style={styles.settingItem} onTouchEnd={handleChangeInstrument}>
            <View style={styles.settingIcon}>
              <Text style={styles.iconText}>🎵</Text>
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingText}>Change Instrument</Text>
              <Text style={styles.settingValue}>Harmonium</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </View>

          {/* Change Level */}
          <View style={styles.settingItem} onTouchEnd={handleChangeLevel}>
            <View style={styles.settingIcon}>
              <Text style={styles.iconText}>🎯</Text>
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingText}>Change Level</Text>
              <Text style={styles.settingValue}>Beginner</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </View>

          {/* Notification Settings */}
          <View style={styles.settingItem} onTouchEnd={handleNotificationSettings}>
            <View style={styles.settingIcon}>
              <Text style={styles.iconText}>🔔</Text>
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingText}>Notification Settings</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  background: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 24,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 67,
    height: 67,
    borderRadius: 33.5,
    backgroundColor: '#9810FA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  profileInfo: {
    alignItems: 'center',
    gap: 4,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  profileInstrument: {
    fontSize: 16,
    fontWeight: '400',
    color: '#666666',
  },
  profileLevel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9810FA',
  },
  settingsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  settingIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  settingValue: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666666',
  },
  chevron: {
    fontSize: 20,
    color: '#666666',
    marginLeft: 8,
  },
});
