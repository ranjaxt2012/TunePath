import { Tabs } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, Spacing, Radius } from '@/src/design';
import { SupportBot } from '@/src/components/SupportBot';
import { AppTour } from '@/src/components/AppTour';

const TABS = [
  { name: 'discover', label: 'Discover', icon: 'compass-outline', iconActive: 'compass' },
  { name: 'learning', label: 'Learning', icon: 'book-outline', iconActive: 'book' },
  { name: 'create', label: 'Create', icon: 'add-outline', iconActive: 'add-circle' },
  { name: 'profile', label: 'Profile', icon: 'person-outline', iconActive: 'person' },
] as const;

function CustomTabBar({ state, navigation }: { state: any; navigation: any }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  if (Platform.OS === 'web') return null;

  return (
    <View style={[styles.tabBar, { backgroundColor: theme.background, borderTopColor: theme.border, paddingBottom: Math.max(insets.bottom, 8) }]}>
      {TABS.map((tab, index) => {
        const focused = state.index === index;
        return (
          <TouchableOpacity key={tab.name} style={styles.tabItem} onPress={() => navigation.navigate(tab.name)} activeOpacity={0.7}>
            <Ionicons name={focused ? (tab.iconActive as any) : (tab.icon as any)} size={22} color={focused ? theme.primary : theme.textDisabled} />
            <Text style={[styles.tabLabel, { color: focused ? theme.primary : theme.textDisabled }]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: { flexDirection: 'row', borderTopWidth: 0.5, paddingTop: 8, alignItems: 'center' },
  tabItem: { flex: 1, alignItems: 'center', gap: 3, paddingVertical: 2 },
  tabLabel: { fontSize: 10, fontWeight: '500' },
});

export default function TabLayout() {
  const { theme } = useTheme();

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.textDisabled,
          tabBarStyle: { backgroundColor: theme.background, borderTopColor: theme.border },
        }}
        tabBar={(props) => <CustomTabBar {...props} />}
      >
        <Tabs.Screen name="discover" options={{ title: 'Discover', tabBarIcon: ({ focused, color }) => <Ionicons name={focused ? 'compass' : 'compass-outline'} size={22} color={color} /> }} />
        <Tabs.Screen name="learning" options={{ title: 'Learning', tabBarIcon: ({ focused, color }) => <Ionicons name={focused ? 'book' : 'book-outline'} size={22} color={color} /> }} />
        <Tabs.Screen name="create" options={{ title: 'Create', tabBarIcon: ({ focused, color }) => <Ionicons name={focused ? 'add-circle' : 'add-outline'} size={22} color={color} /> }} />
        <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ focused, color }) => <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} /> }} />
      </Tabs>
      {Platform.OS !== 'web' && <SupportBot />}
      <AppTour />
    </View>
  );
}
