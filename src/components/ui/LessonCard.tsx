import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Pressable, Image, StyleSheet, Modal, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, Spacing, Radius, FontSize } from '@/src/design';
import { useRouter } from 'expo-router';
import { setAuthToken, BASE_URL } from '@/src/services/api';
import { useAuth } from '@clerk/clerk-expo';
import type { Lesson } from '@/src/types/models';

interface LessonCardProps {
  lesson: Lesson;
  size: 'mini' | 'regular' | 'featured';
  onPress: () => void;
  width?: number;
  thumbHeight?: number;
  dbUserId?: string | null;
  isAdmin?: boolean;
  onDelete?: (lessonId: string) => void;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function LessonCard({ lesson, size, onPress, width = 140, thumbHeight = 90, dbUserId, isAdmin, onDelete }: LessonCardProps) {
  const { theme } = useTheme();
  const router = useRouter();
  const { getToken } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = Boolean(isAdmin || (dbUserId != null && lesson.tutor_id === dbUserId));

  const handlePlay = () => {
    setMenuVisible(false);
    router.push(`/lesson/${lesson.id}`);
  };

  const handleEdit = () => {
    setMenuVisible(false);
    router.push(`/lesson/${lesson.id}`);
  };

  const handleDelete = () => {
    // Show the Alert while the Modal is still open — on iOS, dismissing a Modal
    // and then immediately presenting a UIAlertController causes the alert to be
    // silently swallowed mid-animation. We close the Modal from inside each button.
    Alert.alert(
      'Delete lesson?',
      `"${lesson.title}" will be permanently deleted from TunePath and cannot be recovered.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => setMenuVisible(false),
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setMenuVisible(false);
            void executeDelete();
          },
        },
      ]
    );
  };

  const executeDelete = async () => {
    setIsDeleting(true);
    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      setAuthToken(token);

      console.log(`[LessonCard] DELETE ${lesson.id}`);

      // Call DELETE endpoint
      const response = await fetch(
        `${BASE_URL}/api/tutor/lessons/${lesson.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 204 || response.ok) {
        // Success — notify parent to remove from list
        console.log(`[LessonCard] DELETE success ${lesson.id}`);
        onDelete?.(lesson.id);
      } else {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail ?? `Delete failed: HTTP ${response.status}`);
      }
    } catch (e: any) {
      console.error(`[LessonCard] DELETE error:`, e);
      Alert.alert('Delete failed', e?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMenuPress = (e: any) => {
    e.stopPropagation?.();
    setMenuVisible(true);
  };

  if (size === 'mini') {
    return (
      <>
        <TouchableOpacity
          style={[styles.miniCard, {
            backgroundColor: theme.surface,
            width,
            shadowColor: theme.cardShadow,
            shadowOpacity: theme.isDark ? 0 : 1,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 8,
            elevation: theme.isDark ? 0 : 3,
          }]}
          onPress={onPress}
          activeOpacity={0.8}
        >
          {/* Thumbnail */}
          <View style={[styles.miniThumbContainer, { height: thumbHeight }]}>
            {lesson.thumbnail_url ? (
              <Image source={{ uri: lesson.thumbnail_url }} style={[styles.miniThumb, { height: thumbHeight }]} resizeMode="cover" />
            ) : (
              <View style={[styles.miniThumb, { height: thumbHeight, backgroundColor: theme.surfaceHigh, alignItems: 'center', justifyContent: 'center' }]}>
                <Ionicons name="musical-notes" size={24} color={theme.textDisabled} />
              </View>
            )}
            {/* Duration badge top-right */}
            <View style={[styles.durationBadge, { backgroundColor: theme.overlay }]}>
              <Text style={[styles.durationText, { color: theme.textOnPrimary }]}>
                {formatDuration(lesson.duration_seconds)}
              </Text>
            </View>
          </View>
          {/* Info */}
          <View style={styles.miniInfo}>
            <Text style={[styles.miniTitle, { color: theme.textPrimary }]} numberOfLines={2}>
              {lesson.title}
            </Text>
            <View style={styles.creatorRowWithMenu}>
              <View style={styles.creatorNameGroup}>
                <Text style={[styles.creatorName, { color: theme.textSecondary }]} numberOfLines={1}>
                  {lesson.creator_name ?? 'Unknown'}
                </Text>
                {lesson.creator_verified && (
                  <Text style={[styles.verifiedDot, { color: theme.primary }]}> •</Text>
                )}
              </View>
              {isOwner && (
                <TouchableOpacity
                  onPress={handleMenuPress}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityRole="button"
                  accessibilityLabel="Lesson actions"
                >
                  <Ionicons name="ellipsis-horizontal" size={16} color={theme.textDisabled} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </TouchableOpacity>
        {isDeleting && (
          <View style={[
            StyleSheet.absoluteFillObject,
            {
              backgroundColor: 'rgba(0,0,0,0.5)',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: Radius.lg,
              zIndex: 100,
            }
          ]}>
            <ActivityIndicator size="large" color="white" />
            <Text style={{ color: 'white', marginTop: 8, fontSize: 13 }}>Deleting...</Text>
          </View>
        )}
        <LessonCardMenu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          onPlay={handlePlay}
          onEdit={isOwner ? handleEdit : undefined}
          onDelete={isOwner ? handleDelete : undefined}
          theme={theme}
          isDeleting={isDeleting}
        />
      </>
    );
  }

  if (size === 'regular') {
    return (
      <>
        <TouchableOpacity
          style={[styles.regularCard, {
            backgroundColor: theme.surface,
            shadowColor: theme.cardShadow,
            shadowOpacity: theme.isDark ? 0 : 1,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 8,
            elevation: theme.isDark ? 0 : 3,
          }]}
          onPress={onPress}
          activeOpacity={0.8}
        >
          {/* Left thumbnail */}
          <View style={styles.regularThumbContainer}>
            {lesson.thumbnail_url ? (
              <Image source={{ uri: lesson.thumbnail_url }} style={styles.regularThumb} resizeMode="cover" />
            ) : (
              <View style={[styles.regularThumb, { backgroundColor: theme.surfaceHigh, alignItems: 'center', justifyContent: 'center' }]}>
                <Ionicons name="musical-notes" size={20} color={theme.textDisabled} />
              </View>
            )}
          </View>
          {/* Right info */}
          <View style={styles.regularInfo}>
            <Text style={[styles.regularTitle, { color: theme.textPrimary }]} numberOfLines={2}>
              {lesson.title}
            </Text>
            <View style={styles.creatorRowWithMenu}>
              <View style={styles.creatorNameGroup}>
                <Text style={[styles.creatorName, { color: theme.textSecondary }]} numberOfLines={1}>
                  {lesson.creator_name ?? 'Unknown'}
                </Text>
                {lesson.creator_verified && (
                  <Text style={[styles.verifiedDot, { color: theme.primary }]}> •</Text>
                )}
              </View>
              {isOwner && (
                <TouchableOpacity
                  onPress={handleMenuPress}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityRole="button"
                  accessibilityLabel="Lesson actions"
                >
                  <Ionicons name="ellipsis-horizontal" size={16} color={theme.textDisabled} />
                </TouchableOpacity>
              )}
            </View>
            {lesson.level_slug && (
              <View style={[styles.levelBadge, { backgroundColor: theme.primaryLight }]}>
                <Text style={[styles.levelText, { color: theme.primary }]}>
                  {lesson.level_slug}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
        {isDeleting && (
          <View style={[
            StyleSheet.absoluteFillObject,
            {
              backgroundColor: 'rgba(0,0,0,0.5)',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: Radius.lg,
              zIndex: 100,
            }
          ]}>
            <ActivityIndicator size="large" color="white" />
            <Text style={{ color: 'white', marginTop: 8, fontSize: 13 }}>Deleting...</Text>
          </View>
        )}
        <LessonCardMenu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          onPlay={handlePlay}
          onEdit={isOwner ? handleEdit : undefined}
          onDelete={isOwner ? handleDelete : undefined}
          theme={theme}
          isDeleting={isDeleting}
        />
      </>
    );
  }

  // featured
  return (
    <>
      <TouchableOpacity style={styles.featuredCard} onPress={onPress} activeOpacity={0.9}>
        {/* Background thumbnail */}
        {lesson.thumbnail_url ? (
          <Image
            source={{ uri: lesson.thumbnail_url }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
        ) : (
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.surfaceHigh }]} />
        )}

        {/* Duration badge top-right */}
        <View style={[styles.featuredDurationBadge, { backgroundColor: theme.overlay }]}>
          <Text style={[styles.durationText, { color: theme.textOnPrimary }]}>
            {formatDuration(lesson.duration_seconds)}
          </Text>
        </View>

        {/* Center play button */}
        <View style={[styles.featuredPlayBtn, { backgroundColor: theme.primary }]}>
          <Ionicons name="play" size={28} color={theme.textOnPrimary} style={{ marginLeft: 3 }} />
        </View>

        {/* Bottom gradient overlay with title + creator */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.75)']}
          style={styles.featuredGradient}
        >
          <Text style={[styles.featuredTitle, { color: theme.textOnPrimary }]} numberOfLines={2}>
            {lesson.title}
          </Text>
          <View style={styles.creatorRowWithMenu}>
            <View style={styles.creatorNameGroup}>
              <Text style={[styles.featuredCreator, { color: theme.textOnPrimary }]} numberOfLines={1}>
                {lesson.creator_name ?? 'Unknown'}
              </Text>
              {lesson.creator_verified && (
                <Text style={[styles.verifiedDot, { color: theme.primary }]}> •</Text>
              )}
            </View>
            {isOwner && (
              <TouchableOpacity
                onPress={handleMenuPress}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Lesson actions"
              >
                <Ionicons name="ellipsis-horizontal" size={16} color="rgba(255,255,255,0.85)" />
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
      {isDeleting && (
        <View style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: Radius.lg,
            zIndex: 100,
          }
        ]}>
          <ActivityIndicator size="large" color="white" />
          <Text style={{ color: 'white', marginTop: 8, fontSize: 13 }}>Deleting...</Text>
        </View>
      )}
      <LessonCardMenu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        onPlay={handlePlay}
        onEdit={isOwner ? handleEdit : undefined}
        onDelete={isOwner ? handleDelete : undefined}
        theme={theme}
        isDeleting={isDeleting}
      />
    </>
  );
}

interface LessonCardMenuProps {
  visible: boolean;
  onDismiss: () => void;
  onPlay: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  theme: any;
  isDeleting: boolean;
}

function LessonCardMenu({ visible, onDismiss, onPlay, onEdit, onDelete, theme, isDeleting }: LessonCardMenuProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      {/* Root fills the screen. Backdrop is rendered first (below), sheet second (on top). */}
      <View style={{ flex: 1 }}>
        <Pressable
          style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
          onPress={onDismiss}
        />
        <View style={styles.menuOverlay}>
          <View style={[styles.menuSheet, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {/* Play */}
          <TouchableOpacity style={styles.menuItem} onPress={onPlay}>
            <Ionicons name="play-circle-outline" size={20} color={theme.primary} style={styles.menuIcon} />
            <Text style={[styles.menuText, { color: theme.textPrimary }]}>Play lesson</Text>
          </TouchableOpacity>

          {/* Edit — tutor only */}
          {onEdit && (
            <>
              <View style={[styles.menuDivider, { backgroundColor: theme.border }]} />
              <TouchableOpacity style={styles.menuItem} onPress={onEdit}>
                <Ionicons name="pencil-outline" size={20} color={theme.primary} style={styles.menuIcon} />
                <Text style={[styles.menuText, { color: theme.textPrimary }]}>Edit notation</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Delete — tutor only, red */}
          {onDelete && (
            <>
              <View style={[styles.menuDivider, { backgroundColor: theme.border }]} />
              <TouchableOpacity style={styles.menuItem} onPress={onDelete} disabled={isDeleting}>
                {isDeleting ? (
                  <ActivityIndicator size="small" color={theme.error} style={styles.menuIcon} />
                ) : (
                  <Ionicons name="trash-outline" size={20} color={theme.error} style={styles.menuIcon} />
                )}
                <Text style={[styles.menuText, { color: theme.error }]}>Delete lesson</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Cancel */}
          <View style={[styles.menuDivider, { backgroundColor: theme.border }]} />
          <TouchableOpacity style={styles.menuItem} onPress={onDismiss}>
            <Text style={[styles.menuText, { color: theme.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Mini
  miniCard: {
    width: 140,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  miniThumbContainer: {
    width: '100%',
    height: 90,
    position: 'relative',
  },
  miniThumb: {
    width: '100%',
    height: 90,
  },
  miniInfo: {
    padding: Spacing.sm,
    gap: Spacing.xs,
  },
  miniTitle: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    lineHeight: 18,
  },

  // Regular
  regularCard: {
    flexDirection: 'row',
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.xs,
  },
  regularThumbContainer: {
    width: 100,
    height: 75,
  },
  regularThumb: {
    width: 100,
    height: 75,
  },
  regularInfo: {
    flex: 1,
    padding: Spacing.sm,
    gap: Spacing.xs,
  },
  regularTitle: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    lineHeight: 18,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  levelText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  // Featured
  featuredCard: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredDurationBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  featuredPlayBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  featuredTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    lineHeight: 22,
  },
  featuredCreator: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    opacity: 0.9,
  },

  // Shared
  durationBadge: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.xs + 2,
    paddingVertical: 2,
  },
  durationText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creatorRowWithMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.xs,
  },
  creatorNameGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  creatorName: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    flexShrink: 1,
  },
  verifiedDot: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },

  // Menu sheet
  menuOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: Spacing.xl,
  },
  menuSheet: {
    borderRadius: Radius.lg,
    minWidth: 200,
    overflow: 'hidden',
    borderWidth: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 44,
  },
  menuIcon: {
    marginRight: Spacing.sm,
  },
  menuText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
  },
});
