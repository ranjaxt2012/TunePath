import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, Spacing, FontSize, Radius } from '@/src/design';
import { WEB_MAX_WIDTH, WEB_SIDEBAR_WIDTH } from '@/src/utils/platform';

const NAV_ITEMS = [
  {
    label: 'Discover',
    icon: 'compass-outline',
    iconActive: 'compass',
    route: '/(tabs)/discover',
    segment: 'discover',
  },
  {
    label: 'Learning',
    icon: 'book-outline',
    iconActive: 'book',
    route: '/(tabs)/learning',
    segment: 'learning',
  },
  {
    label: 'Create',
    icon: 'add-circle-outline',
    iconActive: 'add-circle',
    route: '/(tabs)/create',
    segment: 'create',
  },
  {
    label: 'Profile',
    icon: 'person-outline',
    iconActive: 'person',
    route: '/(tabs)/profile',
    segment: 'profile',
  },
] as const;

interface WebLayoutProps {
  children: React.ReactNode;
}

export function WebLayout({ children }: WebLayoutProps) {
  const { theme } = useTheme();
  const router = useRouter();
  const segments = useSegments();

  const activeSegment = segments[1] ?? 'discover';

  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* TOP BAR */}
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: theme.background,
            borderBottomColor: theme.border,
          },
        ]}
      >
        <View style={styles.topBarInner}>
          <Text style={[styles.logo, { color: theme.primary }]}>
            🎵 TunePath
          </Text>

          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            <Ionicons name="search-outline" size={16} color={theme.textDisabled} />
            <Text style={[styles.searchPlaceholder, { color: theme.textDisabled }]}>
              Search songs, artists...
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.topBarProfile, { backgroundColor: theme.surface }]}
            onPress={() => router.push('/(tabs)/profile' as any)}
          >
            <Ionicons name="person-outline" size={18} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* BODY */}
      <View style={styles.body}>
        {/* SIDEBAR */}
        <View
          style={[
            styles.sidebar,
            {
              backgroundColor: theme.background,
              borderRightColor: theme.border,
              width: WEB_SIDEBAR_WIDTH,
            },
          ]}
        >
          {NAV_ITEMS.map((item) => {
            const active = activeSegment === item.segment;
            return (
              <TouchableOpacity
                key={item.route}
                style={[
                  styles.navItem,
                  active && { backgroundColor: theme.surface },
                ]}
                onPress={() => router.push(item.route as any)}
              >
                <Ionicons
                  name={active ? (item.iconActive as any) : (item.icon as any)}
                  size={20}
                  color={active ? theme.primary : theme.textSecondary}
                />
                <Text
                  style={[
                    styles.navLabel,
                    {
                      color: active ? theme.primary : theme.textSecondary,
                      fontWeight: active ? '600' : '400',
                    },
                  ]}
                >
                  {item.label}
                </Text>
                {item.segment === 'create' && (
                  <View style={[styles.createBadge, { backgroundColor: theme.primary }]}>
                    <Ionicons name="add" size={12} color={theme.textOnPrimary} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* MAIN CONTENT */}
        <View style={styles.content}>
          <View style={styles.contentInner}>{children}</View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: '100vh' as any,
  },
  topBar: {
    height: 60,
    borderBottomWidth: 0.5,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    position: 'sticky' as any,
    top: 0,
    zIndex: 100,
  },
  topBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: WEB_MAX_WIDTH,
    width: '100%',
    alignSelf: 'center',
    gap: Spacing.lg,
  },
  logo: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    minWidth: 140,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 0.5,
    maxWidth: 400,
  },
  searchPlaceholder: {
    fontSize: FontSize.sm,
  },
  topBarProfile: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    flexDirection: 'row',
    maxWidth: WEB_MAX_WIDTH,
    width: '100%',
    alignSelf: 'center',
  },
  sidebar: {
    borderRightWidth: 0.5,
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.xs,
  },
  navLabel: {
    fontSize: FontSize.md,
    flex: 1,
  },
  createBadge: {
    width: 20,
    height: 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    overflow: 'hidden' as any,
  },
  contentInner: {
    flex: 1,
    maxWidth: 860,
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.xl,
  },
});
