import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { progressStyles } from '../../src/styles/progressStyles';

// Stat Card Component
function StatCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={progressStyles.statCard}>
      <Text style={progressStyles.statIcon}>{icon}</Text>
      <Text style={progressStyles.statValue}>{value}</Text>
      <Text style={progressStyles.statLabel}>{label}</Text>
    </View>
  );
}

// Instrument Progress Component
function InstrumentProgress({ name, progress }: { name: string; progress: number }) {
  return (
    <View style={progressStyles.instrumentProgress}>
      <View style={progressStyles.progressHeader}>
        <Text style={progressStyles.instrumentName}>{name}</Text>
        <Text style={progressStyles.progressPercentage}>{progress}%</Text>
      </View>
      <View style={progressStyles.progressBarContainer}>
        <View style={[progressStyles.progressBar, { width: `${progress}%` }]} />
      </View>
    </View>
  );
}

// Session Card Component
function SessionCard({ lessonName, date, duration }: { lessonName: string; date: string; duration: string }) {
  return (
    <View style={progressStyles.sessionCard}>
      <View style={progressStyles.sessionInfo}>
        <Text style={progressStyles.sessionTitle}>{lessonName}</Text>
        <Text style={progressStyles.sessionDate}>{date}</Text>
      </View>
      <Text style={progressStyles.sessionDuration}>{duration}</Text>
    </View>
  );
}

export default function ProgressScreen() {
  const router = useRouter();

  const instruments = [
    { name: 'Harmonium', progress: 65 },
    { name: 'Guitar', progress: 20 },
    { name: 'Piano', progress: 0 },
  ];

  const recentSessions = [
    { lessonName: 'Raag Yaman Basics', date: 'Today', duration: '10 mins' },
    { lessonName: 'Scale Practice', date: 'Yesterday', duration: '15 mins' },
    { lessonName: 'Rhythm Exercises', date: 'Feb 25', duration: '12 mins' },
    { lessonName: 'Harmonium Basics', date: 'Feb 24', duration: '20 mins' },
  ];

  return (
    <View style={progressStyles.container}>
      {/* Header */}
      <View style={progressStyles.headerContainer}>
        <Text style={progressStyles.title}>Your Progress</Text>
      </View>

      {/* Main Content */}
      <ScrollView style={progressStyles.mainContent} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Summary Stats Card */}
        <View style={progressStyles.statsCard}>
          <View style={progressStyles.statsContainer}>
            <StatCard
              icon="⏰"
              label="Practice Time"
              value="2h 35m"
            />
            <View style={progressStyles.divider} />
            <StatCard
              icon="🏆"
              label="Completed"
              value="12"
            />
            <View style={progressStyles.divider} />
            <StatCard
              icon="🔥"
              label="Day Streak"
              value="5"
            />
          </View>
        </View>

        {/* Progress by Instrument */}
        <View style={progressStyles.section}>
          <Text style={progressStyles.sectionTitle}>Progress by Instrument</Text>
          <View style={progressStyles.instrumentProgressCard}>
            {instruments.map((instrument) => (
              <InstrumentProgress
                key={instrument.name}
                name={instrument.name}
                progress={instrument.progress}
              />
            ))}
          </View>
        </View>

        {/* Recent Sessions */}
        <View style={progressStyles.section}>
          <Text style={progressStyles.sectionTitle}>Recent Sessions</Text>
          <View style={progressStyles.sessionsContainer}>
            {recentSessions.map((session, index) => (
              <SessionCard
                key={index}
                lessonName={session.lessonName}
                date={session.date}
                duration={session.duration}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Tab Bar */}
      <View style={progressStyles.bottomTabBar}>
        <View style={progressStyles.tabBarContent}>
          {/* Home Tab */}
          <Pressable
            style={progressStyles.tabButton}
            onPress={() => router.push('/home')}
          >
            <Text style={progressStyles.tabIconInactive}>🏠</Text>
            <Text style={progressStyles.tabTextInactive}>Home</Text>
          </Pressable>

          {/* Practice Tab */}
          <Pressable
            style={progressStyles.tabButton}
            onPress={() => router.push('/practice')}
          >
            <Text style={progressStyles.tabIconInactive}>🎵</Text>
            <Text style={progressStyles.tabTextInactive}>Practice</Text>
          </Pressable>

          {/* Progress Tab - Active */}
          <Pressable
            style={progressStyles.tabButton}
            onPress={() => console.log('Already on Progress')}
          >
            <Text style={progressStyles.tabIconActive}>📊</Text>
            <Text style={progressStyles.tabTextActive}>Progress</Text>
          </Pressable>

          {/* Profile Tab */}
          <Pressable
            style={progressStyles.tabButton}
            onPress={() => router.push('/profile')}
          >
            <Text style={progressStyles.tabIconInactive}>👤</Text>
            <Text style={progressStyles.tabTextInactive}>Profile</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
