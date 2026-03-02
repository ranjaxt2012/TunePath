import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { BottomTabBar } from '../../src/components/ui';
import { progressStyles } from '../../src/styles/progressStyles';

// Stat Card Component
const StatCard = React.memo(function StatCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={progressStyles.statCard}>
      <Text style={progressStyles.statIcon}>{icon}</Text>
      <Text style={progressStyles.statValue}>{value}</Text>
      <Text style={progressStyles.statLabel}>{label}</Text>
    </View>
  );
});

// Instrument Progress Component
const InstrumentProgress = React.memo(function InstrumentProgress({ name, progress }: { name: string; progress: number }) {
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
});

// Session Card Component
const SessionCard = React.memo(function SessionCard({ lessonName, date, duration }: { lessonName: string; date: string; duration: string }) {
  return (
    <View style={progressStyles.sessionCard}>
      <View style={progressStyles.sessionInfo}>
        <Text style={progressStyles.sessionTitle}>{lessonName}</Text>
        <Text style={progressStyles.sessionDate}>{date}</Text>
      </View>
      <Text style={progressStyles.sessionDuration}>{duration}</Text>
    </View>
  );
});

const INSTRUMENTS = [
  { name: 'Harmonium', progress: 65 },
  { name: 'Guitar', progress: 20 },
  { name: 'Piano', progress: 0 },
];

const RECENT_SESSIONS = [
  { lessonName: 'Raag Yaman Basics', date: 'Today', duration: '10 mins' },
  { lessonName: 'Scale Practice', date: 'Yesterday', duration: '15 mins' },
  { lessonName: 'Rhythm Exercises', date: 'Feb 25', duration: '12 mins' },
  { lessonName: 'Harmonium Basics', date: 'Feb 24', duration: '20 mins' },
];

export default function ProgressScreen() {
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
            {INSTRUMENTS.map((instrument) => (
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
            {RECENT_SESSIONS.map((session) => (
              <SessionCard
                key={session.lessonName}
                lessonName={session.lessonName}
                date={session.date}
                duration={session.duration}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <BottomTabBar activeTab="progress" />
    </View>
  );
}
