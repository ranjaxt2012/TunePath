import React, { useCallback, useState } from 'react';
import { ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ScreenGradient } from '@/src/components/common/ScreenGradient';
import { BottomTabBar } from '@/src/components/ui';
import { LoadingState } from '@/src/components/common/LoadingState';
import { ErrorState } from '@/src/components/common/ErrorState';
import { Spacing, Radius, TextPresets, CommonStyles } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useProgressSummary } from '@/src/hooks/useProgressSummary';
import { useOrientation } from '@/src/hooks/useOrientation';

const BAR_MAX_HEIGHT = 72;

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function ProgressScreen() {
  const [period, setPeriod] = useState<'week' | 'overall'>('overall');
  const { summary, loading, error } = useProgressSummary();
  const { theme } = useTheme();
  const { isLandscape } = useOrientation();

  const totalMinutes = summary ? Math.floor(summary.total_practice_seconds / 60) : 0;
  const completedLessons = summary?.completed_lessons ?? 0;
  const recentSessions = summary?.recent_sessions ?? [];
  const byInstrument = summary?.by_instrument ?? [];

  // Generate weekly data (7 days)
  const generateWeeklyData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days.map((day) => ({
      day,
      minutes: Math.floor(Math.random() * 60),
    }));
  };

  const weeklyData = generateWeeklyData();
  const maxMinutes = Math.max(...weeklyData.map((d) => d.minutes), 1);

  const handleShare = useCallback(async () => {
    const message = [
      '🎵 My TunePath Progress',
      `✅ Lessons completed: ${completedLessons}`,
      `⏱ Time practiced: ${totalMinutes} mins`,
      `🔥 Instrument: Harmonium`,
      '',
      'Join me on TunePath!',
    ].join('\n');

    try {
      await Share.share({ message });
    } catch (e) {
      console.error('Share failed:', e);
    }
  }, [completedLessons, totalMinutes]);

  return (
    <ScreenGradient style={styles.container}>
      <SafeAreaView edges={['top']}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Your Progress</Text>
          <TouchableOpacity
            onPress={handleShare}
            style={styles.shareBtn}
          >
            <Ionicons
              name="share-outline"
              size={22}
              color={theme.textPrimary}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.togglePill, period === 'week' && styles.togglePillActive]}
            onPress={() => setPeriod('week')}
          >
            <Text style={[styles.toggleText, { color: period === 'week' ? theme.bgPrimary : theme.textSecondary }]}>
              This Week
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.togglePill, period === 'overall' && styles.togglePillActive]}
            onPress={() => setPeriod('overall')}
          >
            <Text style={[styles.toggleText, { color: period === 'overall' ? theme.bgPrimary : theme.textSecondary }]}>
              Overall
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {isLandscape ? (
        <View style={styles.landscapeContainer}>
          {/* Left panel — stats cards in grid */}
          <View style={styles.statsGridLandscape}>
            {!loading && (
              <>
                {/* Stats Cards */}
                <View style={[styles.statCardLandscape, { backgroundColor: theme.cardBg }]}>
                  <Text style={styles.statIcon}>⏰</Text>
                  <Text style={[styles.statValue, { color: theme.textPrimary }]}>{totalMinutes}m</Text>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Practice Time</Text>
                </View>
                <View style={[styles.statCardLandscape, { backgroundColor: theme.cardBg }]}>
                  <Text style={styles.statIcon}>✅</Text>
                  <Text style={[styles.statValue, { color: theme.textPrimary }]}>{completedLessons}</Text>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Completed</Text>
                </View>
                <View style={[styles.statCardLandscape, { backgroundColor: theme.cardBg }]}>
                  <Text style={styles.statIcon}>🔥</Text>
                  <Text style={[styles.statValue, { color: theme.textPrimary }]}>0</Text>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Day Streak</Text>
                </View>
                <View style={[styles.statCardLandscape, { backgroundColor: theme.cardBg }]}>
                  <Text style={styles.statIcon}>📊</Text>
                  <Text style={[styles.statValue, { color: theme.textPrimary }]}>{byInstrument.length}</Text>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Instruments</Text>
                </View>
              </>
            )}
          </View>

          {/* Right panel — chart + sessions scrollable */}
          <ScrollView style={styles.rightScrollLandscape} showsVerticalScrollIndicator={false}>
            {loading && <LoadingState />}
            {error && <ErrorState message={error} />}

            {/* Weekly Bar Chart */}
            {!loading && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Daily Practice</Text>
                <View style={styles.chartCard}>
                  <View style={styles.chartBars}>
                    {weeklyData.map((item, idx) => {
                      const barH = item.minutes > 0
                        ? Math.max(4, Math.round((item.minutes / maxMinutes) * BAR_MAX_HEIGHT))
                        : 4;
                      const today = new Date();
                      const isToday = idx === (today.getDay() + 6) % 7;
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
                          <Text style={[styles.barLabel, { color: theme.textSecondary }]}>{item.day}</Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </View>
            )}

            {/* Instrument Progress */}
            {!loading && byInstrument.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>By Instrument</Text>
                <View style={styles.card}>
                  {byInstrument.map((inst) => (
                    <View key={inst.slug} style={styles.instrumentRow}>
                      <View style={styles.instrumentRowHeader}>
                        <Text style={[styles.instrumentName, { color: theme.textPrimary }]}>{inst.name}</Text>
                        <Text style={[styles.instrumentPercent, { color: theme.textSecondary }]}>{inst.percent}%</Text>
                      </View>
                      <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${inst.percent}%` as any }]} />
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Recent Sessions */}
            {!loading && recentSessions.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Sessions</Text>
                <View style={styles.sessionsList}>
                  {recentSessions.map((session, idx) => (
                    <View key={idx} style={styles.sessionCard}>
                      <View style={styles.sessionInfo}>
                        <Text style={styles.sessionTitle}>{session.lesson_title}</Text>
                        <Text style={styles.sessionDate}>
                          {new Date(session.started_at).toLocaleDateString()}
                        </Text>
                      </View>
                      <Text style={styles.sessionDuration}>{formatDuration(session.duration_seconds)}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ── Loading State ──────────────────────────────── */}
          {loading && <LoadingState />}

          {/* ── Error State ────────────────────────────────– */}
          {error && <ErrorState message={error} />}

          {/* ── Stats Row ─────────────────────────────────– */}
          {!loading && (
            <View style={[styles.statsRow, { backgroundColor: theme.cardBg }]}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>⏰</Text>
              <Text style={[styles.statValue, { color: theme.textPrimary }]}>{totalMinutes}m</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Practice Time</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>✅</Text>
              <Text style={[styles.statValue, { color: theme.textPrimary }]}>{completedLessons}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Completed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>🔥</Text>
              <Text style={[styles.statValue, { color: theme.textPrimary }]}>0</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Day Streak</Text>
            </View>
          </View>
        )}

        {/* ── Weekly Bar Chart ───────────────────────────── */}
        {!loading && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Daily Practice</Text>
            <View style={[styles.chartCard, { backgroundColor: theme.cardBg }]}>
              <View style={styles.chartBars}>
                {weeklyData.map((item, idx) => {
                  const barH = item.minutes > 0
                    ? Math.max(4, Math.round((item.minutes / maxMinutes) * BAR_MAX_HEIGHT))
                    : 4;
                  const today = new Date();
                  const isToday = idx === (today.getDay() + 6) % 7;
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
        )}

        {/* ── Instrument Progress ────────────────────────── */}
        {!loading && byInstrument.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>By Instrument</Text>
            <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
              {byInstrument.map((inst) => (
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
        )}

        {/* ── Recent Sessions ────────────────────────────── */}
        {!loading && recentSessions.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Recent Sessions</Text>
            <View style={styles.sessionsList}>
              {recentSessions.map((session, idx) => (
                <View key={idx} style={[styles.sessionCard, { backgroundColor: theme.cardBg }]}>
                  <View style={styles.sessionInfo}>
                    <Text style={[styles.sessionTitle, { color: theme.textPrimary }]}>{session.lesson_title}</Text>
                    <Text style={[styles.sessionDate, { color: theme.textSecondary }]}>
                      {new Date(session.started_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={[styles.sessionDuration, { color: theme.textSecondary }]}>{formatDuration(session.duration_seconds)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        </ScrollView>
      )}

      <BottomTabBar activeTab="progress" />
    </ScreenGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    ...CommonStyles.screen,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    ...TextPresets.displayMd,
    flex: 1,
  },
  shareBtn: {
    padding: Spacing.sm,
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
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  toggleText: {
    ...TextPresets.labelSm,
  },
  toggleTextActive: {
  },

  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
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
    ...TextPresets.h1,
  },
  statLabel: {
    ...TextPresets.caption,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 56,
    backgroundColor: 'rgba(255,255,255,0.20)',
    marginHorizontal: Spacing.sm,
  },

  // Sections
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...TextPresets.h2,
    marginBottom: Spacing.md,
  },
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
  },

  // Bar chart
  chartCard: {
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
    backgroundColor: '#FFFFFF',
  },
  barEmpty: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    height: 4,
  },
  barLabel: {
    ...TextPresets.caption,
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
    ...TextPresets.labelMd,
  },
  instrumentPercent: {
    ...TextPresets.bodyMd,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.20)',
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.full,
  },

  // Sessions
  sessionsList: {
    gap: Spacing.sm,
  },
  sessionCard: {
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
    ...TextPresets.labelMd,
    marginBottom: 2,
  },
  sessionDate: {
    ...TextPresets.caption,
  },
  sessionDuration: {
    ...TextPresets.labelSm,
  },

  // ── Landscape Layout ─────────────────────────────────────
  landscapeContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  statsGridLandscape: {
    flex: 0.4,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: Spacing.md,
    gap: Spacing.md,
    alignContent: 'flex-start',
  },
  statCardLandscape: {
    width: '48%',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: 6,
  },
  rightScrollLandscape: {
    flex: 0.6,
    paddingHorizontal: Spacing.lg,
  },
});
