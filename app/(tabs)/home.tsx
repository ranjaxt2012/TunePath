import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/src/store/authStore';
import { Colors, Spacing, Radius, TextPresets, Layout, CommonStyles } from '@/src/constants/theme';
import { InstrumentIcon } from '@/src/components/common/InstrumentIcon';
import { LoadingState } from '@/src/components/common/LoadingState';
import { ErrorState } from '@/src/components/common/ErrorState';
import { useCourses } from '@/src/hooks/useCourses';
import { useInProgressLessons } from '@/src/hooks/useInProgressLessons';
import { ScreenGradient } from '@/src/components/common/ScreenGradient';
import { BottomTabBar } from '@/src/components/ui';

const CATEGORIES = ['All', 'Courses', 'Lessons', 'Beginner', 'Free'];

export default function HomeScreen() {
  const router = useRouter();
  const { user, selectedInstrumentSlug, selectedLevelSlug } = useAuthStore();

  const { courses, loading: coursesLoading, error: coursesError } = useCourses(
    selectedInstrumentSlug || undefined,
    selectedLevelSlug || undefined
  );
  const { lessons: inProgressLessons, loading: lessonsLoading } = useInProgressLessons();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const isSearching = searchOpen && searchText.trim().length > 0;
  const query = searchText.toLowerCase();

  const filteredCourses = courses.filter(
    (c) => c.title.toLowerCase().includes(query)
  );
  const filteredLessons = inProgressLessons.filter(
    (l) => l.title.toLowerCase().includes(query) || l.course_title.toLowerCase().includes(query)
  );

  const showContinueLearning =
    inProgressLessons.length > 0 &&
    (activeCategory === 'All' || activeCategory === 'Lessons') &&
    !lessonsLoading;
  const showFeatured = activeCategory !== 'Lessons' && courses.length > 0;
  const showCourseRows = activeCategory !== 'Lessons' && courses.length > 0;

  const featuredCourse = courses.length > 0 ? courses[0] : null;

  const greeting = user ? 'Welcome back' : 'Welcome';
  const userName = user?.displayName?.split(' ')[0] ?? '';
  const instrumentLabel = selectedInstrumentSlug
    ? selectedInstrumentSlug.charAt(0).toUpperCase() + selectedInstrumentSlug.slice(1)
    : null;
  const levelLabel = selectedLevelSlug
    ? selectedLevelSlug.charAt(0).toUpperCase() + selectedLevelSlug.slice(1)
    : null;

  return (
    <ScreenGradient style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── HEADER ── */}
        <SafeAreaView edges={['top']}>
          <View style={styles.headerWrap}>

            {/* Line 1: Welcome (left) + Search icon + Category pills (right) */}
            <View style={styles.headerTopRow}>
              <Text style={styles.greeting}>
                {greeting}{userName ? `, ${userName}` : ''} 👋
              </Text>
              <View style={styles.headerRight}>
                <TouchableOpacity
                  style={styles.searchIconBtn}
                  onPress={() => setSearchOpen(!searchOpen)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="search" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.pillsScroll}
                  contentContainerStyle={styles.pillsRowContent}
                >
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.pill,
                        activeCategory === cat && styles.pillActive,
                      ]}
                      onPress={() => setActiveCategory(cat)}
                    >
                      <Text style={[
                        styles.pillText,
                        activeCategory === cat && styles.pillTextActive,
                      ]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            {/* Line 2: Instrument · Level */}
            <View style={styles.subheadingRow}>
              {instrumentLabel ? (
                <>
                  <InstrumentIcon slug={selectedInstrumentSlug ?? ''} size={20} />
                  <Text style={styles.subheading}>{instrumentLabel}{levelLabel ? ` · ${levelLabel}` : ''}</Text>
                </>
              ) : (
                <Text style={styles.subheading}>Choose your instrument →</Text>
              )}
            </View>

          </View>
        </SafeAreaView>

        {/* Search input — visible when searchOpen */}
        {searchOpen && (
          <View style={styles.searchInputContainer}>
            <TextInput
              style={styles.searchInput}
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search courses and lessons..."
              placeholderTextColor={Colors.textTertiary}
              returnKeyType="search"
              autoCorrect={false}
              autoFocus
            />
          </View>
        )}

        {/* ── Loading State ──────────────────────────────── */}
        {coursesLoading && selectedInstrumentSlug && selectedLevelSlug && !isSearching && (
          <LoadingState />
        )}

        {/* ── Error State ────────────────────────────────── */}
        {coursesError && !isSearching && (
          <ErrorState message={coursesError} />
        )}

        {/* ── Search Results ───────────────────────────── */}
        {isSearching ? (
          <View style={styles.searchResults}>
            {filteredCourses.length === 0 && filteredLessons.length === 0 ? (
              <Text style={styles.noResults}>No results found</Text>
            ) : (
              <>
                {filteredCourses.map((course) => (
                  <TouchableOpacity
                    key={course.id}
                    style={styles.searchResultCard}
                    onPress={() => router.push(`/course/${course.id}` as any)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.searchResultTitle}>{course.title}</Text>
                    <Text style={styles.searchResultSubtitle}>{course.level_slug || 'Course'}</Text>
                  </TouchableOpacity>
                ))}
                {filteredLessons.map((lesson) => (
                  <TouchableOpacity
                    key={lesson.id}
                    style={styles.searchResultCard}
                    onPress={() => router.push(`/lesson/${lesson.id}` as any)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.searchResultTitle}>{lesson.title}</Text>
                    <Text style={styles.searchResultSubtitle}>{lesson.course_title}</Text>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </View>
        ) : (
          <>
            {/* ── Featured Banner ──────────────────────────── */}
            {showFeatured && featuredCourse && (
              <View style={styles.featuredBanner}>
                <View style={styles.featuredInner}>
                  <View style={styles.featuredBadge}>
                    <Text style={styles.featuredBadgeText}>FEATURED</Text>
                  </View>
                  <Text style={styles.featuredTitle}>{featuredCourse.title}</Text>
                  <Text style={styles.featuredSubtitle} numberOfLines={2}>
                    {featuredCourse.description || 'Explore this course'}
                  </Text>
                  <View style={styles.featuredButtons}>
                    <TouchableOpacity
                      style={styles.playButton}
                      onPress={() => router.push(`/course/${featuredCourse.id}` as any)}
                    >
                      <Text style={styles.playButtonText}>▶  Start Learning</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.infoButton}>
                      <Text style={styles.infoButtonText}>More Info</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* ── Continue Learning ──────── */}
            {showContinueLearning && (
              <View style={styles.section}>
                <View style={CommonStyles.sectionHeader}>
                  <Text style={CommonStyles.sectionTitle}>Continue Learning</Text>
                  <Text style={CommonStyles.sectionLink}>See all</Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.rowContent}
                >
                  {inProgressLessons.map((lesson) => (
                    <TouchableOpacity
                      key={lesson.id}
                      style={styles.continueCard}
                      onPress={() => router.push(`/lesson/${lesson.id}` as any)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.continueThumbnail}>
                        <InstrumentIcon slug={lesson.instrument_slug} size={32} />
                      </View>
                      <View style={styles.continueInfo}>
                        <Text style={styles.continueTitle} numberOfLines={2}>
                          {lesson.title}
                        </Text>
                        <Text style={styles.continueCourse}>{lesson.course_title}</Text>
                        <View style={styles.progressBarBg}>
                          <View
                            style={[styles.progressBarFill, { width: `${lesson.watch_percent}%` as any }]}
                          />
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* ── Netflix-style Course Rows ─────────────────── */}
            {showCourseRows && courses.length > 0 && (
              <View style={styles.section}>
                <View style={CommonStyles.sectionHeader}>
                  <Text style={CommonStyles.sectionTitle}>Explore Courses</Text>
                  <Text style={CommonStyles.sectionLink}>See all</Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.rowContent}
                >
                  {courses.map((course) => (
                    <TouchableOpacity
                      key={course.id}
                      style={styles.courseCard}
                      onPress={() => router.push(`/course/${course.id}` as any)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.courseThumbnail}>
                        <InstrumentIcon slug={course.instrument_slug} size={32} />
                      </View>
                      <Text style={styles.courseTitle} numberOfLines={2}>{course.title}</Text>
                      <Text style={styles.courseSubtitle}>{course.level_slug || 'Course'}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

          </>
        )}
      </ScrollView>

      <BottomTabBar activeTab="home" />
    </ScreenGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    ...CommonStyles.screen,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },

  // ── Header ──────────────────────────────────────────────
  headerWrap: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  greeting: {
    ...TextPresets.displayMd,
    color: Colors.textPrimary,
  },
  headerRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginLeft: Spacing.md,
  },
  pillsScroll: {
    flex: 1,
  },
  searchIconBtn: {
    minWidth: 44,
    minHeight: 44,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  subheadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  subheading: {
    ...TextPresets.bodyMd,
    color: Colors.textSecondary,
  },
  pillsRowContent: {
    gap: Spacing.sm,
    alignItems: 'center',
  },
  pill: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.40)',
  },
  pillActive: {
    backgroundColor: Colors.white,
    borderColor: Colors.white,
  },
  pillText: {
    ...TextPresets.labelMd,
    color: Colors.textPrimary,
  },
  pillTextActive: {
    color: Colors.bgPrimary,
  },

  // Search input (expandable)
  searchInputContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  searchInput: {
    height: 44,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.30)',
    paddingHorizontal: Spacing.xl,
    ...TextPresets.bodyMd,
    color: Colors.textPrimary,
  },

  // Search results
  searchResults: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  searchResultCard: {
    ...CommonStyles.card,
    marginBottom: Spacing.sm,
  },
  searchResultTitle: {
    ...TextPresets.labelMd,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  searchResultSubtitle: {
    ...TextPresets.caption,
    color: Colors.textSecondary,
  },
  noResults: {
    ...TextPresets.bodyMd,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xxl,
  },

  // ── Featured banner ──────────────────────────────────────
  featuredBanner: {
    marginHorizontal: Spacing.lg,
    height: Layout.featuredHeight,
    borderRadius: Radius.xl,
    backgroundColor: Colors.cardBg,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
  },
  featuredInner: {
    flex: 1,
    padding: Spacing.xl,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  featuredBadge: {
    backgroundColor: Colors.accentLight,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    alignSelf: 'flex-start',
    marginBottom: Spacing.sm,
  },
  featuredBadgeText: {
    ...TextPresets.labelSm,
    color: Colors.bgPrimary,
  },
  featuredTitle: {
    ...TextPresets.displaySm,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  featuredSubtitle: {
    ...TextPresets.bodyMd,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  featuredButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  playButton: {
    ...CommonStyles.primaryButton,
    flex: 1,
    height: 44,
  },
  playButtonText: {
    ...CommonStyles.primaryButtonText,
    fontSize: 14,
  },
  infoButton: {
    ...CommonStyles.ghostButton,
    flex: 1,
    height: 44,
  },
  infoButtonText: {
    ...CommonStyles.ghostButtonText,
    fontSize: 14,
  },

  // ── Sections ─────────────────────────────────────────────
  section: {
    marginBottom: Spacing.xl,
  },
  rowContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },

  // Continue Learning cards
  continueCard: {
    width: Layout.continueCardWidth,
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  continueThumbnail: {
    width: '100%',
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueInfo: {
    padding: Spacing.sm,
  },
  continueTitle: {
    ...TextPresets.labelMd,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  continueCourse: {
    ...TextPresets.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  progressBarBg: {
    height: 3,
    backgroundColor: Colors.progressBg,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.progressFill,
    borderRadius: Radius.full,
  },

  // Course row cards
  courseCard: {
    width: Layout.rowCardWidth,
  },
  courseThumbnail: {
    width: Layout.rowCardWidth,
    height: Layout.rowCardHeight,
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  courseProgressBarBg: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: Colors.progressBg,
  },
  courseProgressBarFill: {
    height: '100%',
    backgroundColor: Colors.progressFill,
  },
  courseTitle: {
    ...TextPresets.labelSm,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  courseSubtitle: {
    ...TextPresets.caption,
    color: Colors.textSecondary,
  },

});
