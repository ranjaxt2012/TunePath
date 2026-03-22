import { Tabs } from 'expo-router';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/design';
import { useOrientation } from '@/src/hooks/useOrientation';
import { SupportBot } from '@/src/components/SupportBot';
import { AppTour } from '@/src/components/AppTour';

const TABS = [
  {
    name: 'discover',
    label: 'Discover',
    icon: 'compass-outline',
    iconActive: 'compass',
  },
  {
    name: 'learning',
    label: 'Learning',
    icon: 'book-outline',
    iconActive: 'book',
  },
  {
    name: 'create',
    label: 'Create',
    icon: 'add',
    iconActive: 'add',
    isCenter: true,
  },
  {
    name: 'profile',
    label: 'Profile',
    icon: 'person-outline',
    iconActive: 'person',
  },
] as const;

interface TabBarProps {
  state: any;
  navigation: any;
}

function CustomTabBar({ state, navigation }: TabBarProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { isLandscape } = useOrientation();

  const paddingBottom = isLandscape
    ? 4
    : Math.max(insets.bottom, 8);

  return (
    <View
      style={[
        styles.tabBar,
        {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
          paddingBottom,
        },
      ]}
    >
      {TABS.map((tab, index) => {
        const focused = state.index === index;

        if ('isCenter' in tab && tab.isCenter) {
          return (
            <TouchableOpacity
              key={tab.name}
              style={[
                styles.centerBtn,
                {
                  backgroundColor: theme.primary,
                  shadowColor: theme.primary,
                },
              ]}
              onPress={() => navigation.navigate(tab.name)}
              activeOpacity={0.85}
            >
              <Ionicons
                name="add"
                size={28}
                color={theme.textOnPrimary}
              />
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tabItem}
            onPress={() => navigation.navigate(tab.name)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={focused ? (tab.iconActive as any) : (tab.icon as any)}
              size={22}
              color={focused ? theme.primary : theme.textDisabled}
            />
            <Text
              style={[
                styles.tabLabel,
                {
                  color: focused ? theme.primary : theme.textDisabled,
                },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    paddingTop: 8,
    alignItems: 'center',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingVertical: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  centerBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{ headerShown: false }}
        tabBar={(props) => <CustomTabBar {...props} />}
      >
        <Tabs.Screen name="discover" />
        <Tabs.Screen name="learning" />
        <Tabs.Screen name="create" />
        <Tabs.Screen name="profile" />
      </Tabs>
      <SupportBot />
      <AppTour />
    </View>
  );
}
