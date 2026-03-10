import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { display: 'none' }, // Hide default tab bar since we have custom one
        headerShown: false,
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Learn',
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: 'Practice',
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>
  );
}
