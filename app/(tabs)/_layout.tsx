import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          display: 'none',
          backgroundColor: '#5B21B6',
          borderTopWidth: 0,
        },
        headerShown: false,
        // Kept for reference if switching to native tab bar:
        // tabBarStyle: {
        //   backgroundColor: Colors.tabBarBg,
        //   borderTopWidth: 0,
        //   height: Layout.tabBarHeight,
        //   paddingBottom: 8,
        // },
        // tabBarActiveTintColor: Colors.tabActive,
        // tabBarInactiveTintColor: Colors.tabInactive,
      }}
    >
      <Tabs.Screen name="home"     options={{ title: 'Home' }} />
      <Tabs.Screen name="practice" options={{ title: 'Learn' }} />
      <Tabs.Screen name="progress" options={{ title: 'Progress' }} />
      <Tabs.Screen name="profile"  options={{ title: 'Profile' }} />
    </Tabs>
  );
}
