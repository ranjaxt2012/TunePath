import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@clerk/clerk-expo';
import { useTheme, Spacing, Radius, FontSize } from '@/src/design';
import { api, setAuthToken } from '@/src/services/api';
import { Avatar } from '@/src/components/ui/Avatar';
import type { Creator } from '@/src/types/models';

const WEB_CONTENT_MAX = 960;

export default function CreatorProfileScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { username } = useLocalSearchParams<{ username: string }>();
  const { getToken } = useAuth();

  const [creator, setCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const fetchCreator = useCallback(async () => {
    if (!username) return;
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      setAuthToken(token);
      const data = await api.get<Creator>(`/api/users/creator/${username}`);
      setCreator(data);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load creator');
    } finally {
      setLoading(false);
    }
  }, [username, getToken]);

  useEffect(() => {
    void fetchCreator();
  }, [fetchCreator]);

  const handleFollow = async () => {
    if (!creator) return;
    setFollowLoading(true);
    try {
      const token = await getToken();
      setAuthToken(token);
      await api.post(`/api/users/${creator.id}/follow`, {});
      setFollowing((v) => !v);
    } catch {
      // silent fail
    } finally {
      setFollowLoading(false);
    }
  };

  const containerStyle = [
    styles.scrollContent,
    Platform.OS === 'web' && styles.webContainer,
  ];

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Back button */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={theme.textPrimary} />
          <Text style={[styles.backText, { color: theme.textPrimary }]}>Back</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      )}

      {error && !loading && (
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.surface, borderRadius: Radius.md }]}
            onPress={fetchCreator}
          >
            <Text style={[styles.retryText, { color: theme.textPrimary }]}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !error && creator && (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={containerStyle}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile header */}
          <View style={styles.profileHeader}>
            <Avatar
              imageUrl={creator.avatar_url}
              name={creator.display_name}
              size={80}
            />
            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={[styles.displayName, { color: theme.textPrimary }]}>
                  {creator.display_name}
                </Text>
                {creator.is_verified && (
                  <View style={[styles.verifiedBadge, { backgroundColor: theme.primary, borderRadius: Radius.full }]}>
                    <Text style={[styles.verifiedText, { color: theme.textOnPrimary }]}>✓</Text>
                  </View>
                )}
              </View>
              {creator.username && (
                <Text style={[styles.username, { color: theme.textSecondary }]}>
                  @{creator.username}
                </Text>
              )}
            </View>
          </View>

          {/* Bio */}
          {creator.bio ? (
            <Text style={[styles.bio, { color: theme.textSecondary }]}>{creator.bio}</Text>
          ) : null}

          {/* Follow button */}
          <TouchableOpacity
            style={[
              styles.followButton,
              {
                backgroundColor: following ? theme.surface : theme.primary,
                borderRadius: Radius.lg,
                borderWidth: following ? 1 : 0,
                borderColor: theme.border,
              },
            ]}
            onPress={handleFollow}
            disabled={followLoading}
          >
            {followLoading ? (
              <ActivityIndicator size="small" color={following ? theme.textPrimary : theme.textOnPrimary} />
            ) : (
              <Text
                style={[
                  styles.followText,
                  { color: following ? theme.textPrimary : theme.textOnPrimary },
                ]}
              >
                {following ? 'Following' : 'Follow'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: theme.surface, borderRadius: Radius.lg }]}>
              <Text style={[styles.statValue, { color: theme.textPrimary }]}>
                {creator.lesson_count}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Lessons</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.surface, borderRadius: Radius.lg }]}>
              <Text style={[styles.statValue, { color: theme.textPrimary }]}>
                {creator.follower_count}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Followers</Text>
            </View>
          </View>

          {/* Contact card */}
          {(creator.whatsapp || creator.youtube || creator.instagram || creator.website) && (
            <View style={[styles.contactCard, { backgroundColor: theme.surface, borderRadius: Radius.lg }]}>
              <Text style={[styles.contactTitle, { color: theme.textSecondary }]}>Contact</Text>
              <View style={styles.contactRow}>
                {creator.whatsapp && (
                  <TouchableOpacity
                    style={[styles.contactBtn, { backgroundColor: theme.surfaceHigh, borderRadius: Radius.md }]}
                    onPress={() => Linking.openURL(`https://wa.me/${creator.whatsapp}`)}
                  >
                    <Ionicons name="logo-whatsapp" size={20} color={theme.success} />
                    <Text style={[styles.contactBtnLabel, { color: theme.textPrimary }]}>WhatsApp</Text>
                  </TouchableOpacity>
                )}
                {creator.youtube && (
                  <TouchableOpacity
                    style={[styles.contactBtn, { backgroundColor: theme.surfaceHigh, borderRadius: Radius.md }]}
                    onPress={() => Linking.openURL(creator.youtube!)}
                  >
                    <Ionicons name="logo-youtube" size={20} color={theme.error} />
                    <Text style={[styles.contactBtnLabel, { color: theme.textPrimary }]}>YouTube</Text>
                  </TouchableOpacity>
                )}
                {creator.instagram && (
                  <TouchableOpacity
                    style={[styles.contactBtn, { backgroundColor: theme.surfaceHigh, borderRadius: Radius.md }]}
                    onPress={() => Linking.openURL(creator.instagram!)}
                  >
                    <Ionicons name="logo-instagram" size={20} color={theme.textPrimary} />
                    <Text style={[styles.contactBtnLabel, { color: theme.textPrimary }]}>Instagram</Text>
                  </TouchableOpacity>
                )}
                {creator.website && (
                  <TouchableOpacity
                    style={[styles.contactBtn, { backgroundColor: theme.surfaceHigh, borderRadius: Radius.md }]}
                    onPress={() => Linking.openURL(creator.website!)}
                  >
                    <Ionicons name="globe-outline" size={20} color={theme.primary} />
                    <Text style={[styles.contactBtnLabel, { color: theme.textPrimary }]}>Website</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Lessons placeholder */}
          <View style={styles.lessonsSection}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Lessons</Text>
            <View style={[styles.lessonsPlaceholder, { backgroundColor: theme.surface, borderRadius: Radius.lg }]}>
              <ActivityIndicator size="small" color={theme.primary} />
              <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                Loading lessons...
              </Text>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
  },
  backText: {
    fontSize: FontSize.md,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  errorText: {
    fontSize: FontSize.md,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
  retryButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  retryText: {
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.lg,
  },
  webContainer: {
    maxWidth: WEB_CONTENT_MAX,
    alignSelf: 'center',
    width: '100%',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  profileInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  displayName: {
    fontSize: FontSize.xl,
    fontWeight: '700',
  },
  verifiedBadge: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  username: {
    fontSize: FontSize.sm,
  },
  bio: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  followButton: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
  },
  followText: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statValue: {
    fontSize: FontSize.xl,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: FontSize.xs,
  },
  contactCard: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  contactTitle: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  contactBtnLabel: {
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  lessonsSection: {
    gap: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  lessonsPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: FontSize.md,
  },
});
