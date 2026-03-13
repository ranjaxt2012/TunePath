import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenGradient } from '@/src/components/common/ScreenGradient';
import { BottomTabBar } from '@/src/components/ui';
import { Colors, Spacing, Radius, Typography, CommonStyles } from '@/src/constants/theme';
import {
  MOCK_PROGRESS_STATS,
  MOCK_WEEKLY_PROGRESS,
  MOCK_INSTRUMENT_PROGRESS,
  MOCK_RECENT_SESSIONS,
} from '@/src/constants/mockData';

const MAX_MINUTES = Math.max(...MOCK_WEEKLY_PROGRESS.map((d) => d.minutes), 1);
const BAR_MAX_HEIGHT = 72;

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function ProgressScreen() {
  const [period, setPeriod] = useState<'week' | 'overall'>('week');

  return (
    <ScreenGradient style={styles.container}>
      <SafeAreaView edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Progress</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.togglePill, period === 'week' && styles.togglePillActive]}
              onPress={() => setPeriod('week')}
            >
              <Text style={[styles.toggleText, period === 'week' && styles.toggleTextActive]}>
                This Week
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.togglePill, period === 'overall' && styles.togglePillActive]}
              onPress={() => setPeriod('overall')}
            >
              <Text style={[styles.toggleText, period === 'overall' && styles.toggleTextActive]}>
                Overall
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Stats Row ─────────────────────────────────── */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⏰</Text>
            <Text style={styles.statValue}>{MOCK_PROGRESS_STATS.total_minutes}m</Text>
            <Text style={styles.statLabel}>Practice Time</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>✅</Text>
            <Text style={styles.statValue}>{MOCK_PROGRESS_STATS.completed_lessons}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🔥</Text>
            <Text style={styles.statValue}>{MOCK_PROGRESS_STATS.streak_days}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        </View>

        {/* ── Weekly Bar Chart ───────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Practice</Text>
          <View style={styles.chartCard}>
            <View style={styles.chartBars}>
              {MOCK_WEEKLY_PROGRESS.map((item) => {
                const barH = item.minutes > 0
                  ? Math.max(4, Math.round((item.minutes / MAX_MINUTES) * BAR_MAX_HEIGHT))
                  : 4;
                const isToday = item.day === 'Thu'; // placeholder "today" marker
                return (
                  <View key={item.day} style={styles.barColumn}>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.bar,
                          { height: barH },
                          isToday && styles.barToday,
                          item.minutes === 0 && styles.barEmpty,
                        ]}
                      />
                    </View>
                    <Text style={styles.barLabel}>{item.day}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* ── Instrument Progress ────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>By Instrument</Text>
          <View style={styles.card}>
            {MOCK_INSTRUMENT_PROGRESS.map((inst) => (
              <View key={inst.slug} style={styles.instrumentRow}>
                <View style={styles.instrumentRowHeader}>
                  <Text style={styles.instrumentName}>{inst.name}</Text>
                  <Text style={styles.instrumentPercent}>{inst.percent}%</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${inst.percent}%` as any }]} />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ── Recent Sessions ────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Sessions</Text>
          <View style={styles.sessionsList}>
            {MOCK_RECENT_SESSIONS.map((session) => (
              <View key={session.id} style={styles.sessionCard}>
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionTitle}>{session.lesson_title}</Text>
                  <Text style={styles.sessionDate}>{session.date}</Text>
                </View>
                <Text style={styles.sessionDuration}>{formatDuration(session.duration_seconds)}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <BottomTabBar activeTab="progress" />
    </ScreenGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    ...CommonStyles.screen,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    ...Typography.displayMd,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  togglePill: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.40)',
  },
  togglePillActive: {
    backgroundColor: Colors.white,
    borderColor: Colors.white,
  },
  toggleText: {
    ...Typography.labelSm,
    color: Colors.textSecondary,
  },
  toggleTextActive: {
    color: Colors.bgPrimary,
  },

  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  statIcon: {
    fontSize: 24,
  },
  statValue: {
    ...Typography.h1,
    color: Colors.textPrimary,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 56,
    backgroundColor: Colors.progressBg,
    marginHorizontal: Spacing.sm,
  },

  // Sections
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
  },

  // Bar chart
  chartCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: BAR_MAX_HEIGHT + 28,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
  },
  barTrack: {
    width: '60%',
    height: BAR_MAX_HEIGHT,
    justifyContent: 'flex-end',
    marginBottom: Spacing.xs,
  },
  bar: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.50)',
    borderRadius: Radius.sm,
  },
  barToday: {
    backgroundColor: Colors.white,
  },
  barEmpty: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    height: 4,
  },
  barLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },

  // Instrument progress
  instrumentRow: {
    marginBottom: Spacing.lg,
  },
  instrumentRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  instrumentName: {
    ...Typography.labelMd,
    color: Colors.textPrimary,
  },
  instrumentPercent: {
    ...Typography.bodyMd,
    color: Colors.textSecondary,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: Colors.progressBg,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.progressFill,
    borderRadius: Radius.full,
  },

  // Sessions
  sessionsList: {
    gap: Spacing.sm,
  },
  sessionCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    ...Typography.labelMd,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  sessionDate: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  sessionDuration: {
    ...Typography.labelSm,
    color: Colors.textSecondary,
  },
});
