import { Tabs } from 'expo-router';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, Spacing, FontSize, Radius } from '@/src/design';

const NAV_ITEMS = [
  {
    name: 'discover',
    label: 'Discover',
    icon: 'compass-outline' as const,
    iconActive: 'compass' as const,
  },
  {
    name: 'learning',
    label: 'Learning',
    icon: 'book-outline' as const,
    iconActive: 'book' as const,
  },
  {
    name: 'create',
    label: 'Create',
    icon: 'add-circle-outline' as const,
    iconActive: 'add-circle' as const,
    isCreate: true,
  },
  {
    name: 'profile',
    label: 'Profile',
    icon: 'person-outline' as const,
    iconActive: 'person' as const,
  },
];

function WebSidebar() {
  const { theme } = useTheme();
  const router = useRouter();
  const segments = useSegments();
  const activeSegment = segments[1] ?? 'discover';

  return (
    <View
      style={[
        styles.sidebar,
        {
          backgroundColor: theme.background,
          borderRightColor: theme.border,
        },
      ]}
    >
      {/* Logo */}
      <Text style={[styles.logo, { color: theme.primary }]}>🎵 TunePath</Text>

      {/* Nav items */}
      {NAV_ITEMS.map((item) => {
        const active = activeSegment === item.name;
        return (
          <TouchableOpacity
            key={item.name}
            style={[
              styles.navItem,
              active && { backgroundColor: theme.surface },
              item.isCreate && [styles.createItem, { backgroundColor: theme.primary }],
            ]}
            onPress={() => router.push(`/(tabs)/${item.name}` as any)}
          >
            <Ionicons
              name={active ? item.iconActive : item.icon}
              size={20}
              color={
                item.isCreate
                  ? theme.textOnPrimary
                  : active
                  ? theme.primary
                  : theme.textSecondary
              }
            />
            <Text
              style={[
                styles.navLabel,
                {
                  color: item.isCreate
                    ? theme.textOnPrimary
                    : active
                    ? theme.primary
                    : theme.textSecondary,
                  fontWeight: active ? '600' : '400',
                },
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function WebTopBar() {
  const { theme } = useTheme();
  return (
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
            Search songs, artists, instruments...
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function WebTabLayout() {
  const { theme } = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      {/* Top bar */}
      <WebTopBar />

      {/* Body: sidebar + content */}
      <View style={styles.body}>
        <WebSidebar />

        {/* Tabs renders here — content only, tab bar hidden */}
        <View style={styles.content}>
          <Tabs
            screenOptions={{ headerShown: false }}
            tabBar={() => null}
          >
            <Tabs.Screen name="discover" />
            <Tabs.Screen name="learning" />
            <Tabs.Screen name="create" />
            <Tabs.Screen name="profile" />
          </Tabs>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    minHeight: '100vh' as any,
  },
  topBar: {
    height: 56,
    borderBottomWidth: 0.5,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  topBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
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
    maxWidth: 480,
  },
  searchPlaceholder: {
    fontSize: FontSize.sm,
  },
  body: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 220,
    borderRightWidth: 0.5,
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  logo: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
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
  createItem: {
    marginTop: Spacing.sm,
    borderRadius: Radius.lg,
  },
  navLabel: {
    fontSize: FontSize.md,
    flex: 1,
  },
  content: {
    flex: 1,
    maxWidth: 960,
  },
});
