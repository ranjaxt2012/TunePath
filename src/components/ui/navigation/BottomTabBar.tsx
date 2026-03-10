import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { sharedStyles } from '../../../styles/sharedStyles';

type TabName = 'home' | 'practice' | 'progress' | 'profile';

interface BottomTabBarProps {
  activeTab: TabName;
}

const TABS: { name: TabName; icon: string; label: string; route: string }[] = [
  { name: 'home', icon: '🏠', label: 'Learn', route: '/home' },
  { name: 'practice', icon: '🎵', label: 'Practice', route: '/practice' },
  { name: 'progress', icon: '📊', label: 'Progress', route: '/progress' },
  { name: 'profile', icon: '👤', label: 'Profile', route: '/profile' },
];

function BottomTabBar({ activeTab }: BottomTabBarProps) {
  const router = useRouter();
  const [showHelpLabel, setShowHelpLabel] = useState(false);

  const handlePress = useCallback(
    (tab: (typeof TABS)[number]) => {
      if (tab.name !== activeTab) {
        router.push(tab.route as any);
      }
    },
    [activeTab, router]
  );

  const onHelpPress = useCallback(() => console.log('Help & Resources pressed'), []);
  const onHelpPressIn = useCallback(() => setShowHelpLabel(true), []);
  const onHelpPressOut = useCallback(() => setShowHelpLabel(false), []);

  return (
    <View style={sharedStyles.bottomTabBar}>
      <View style={sharedStyles.tabBarContent}>
        {TABS.map((tab) => {
          const isActive = tab.name === activeTab;
          return (
            <Pressable
              key={tab.name}
              style={sharedStyles.tabButton}
              onPress={() => handlePress(tab)}
            >
              <Text style={isActive ? sharedStyles.tabIconActive : sharedStyles.tabIconInactive}>
                {tab.icon}
              </Text>
              <Text style={isActive ? sharedStyles.tabTextActive : sharedStyles.tabTextInactive}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Help button — anchored to bottom-right, styled like a tab item */}
      <View style={sharedStyles.helpButtonWrapper}>
        {showHelpLabel && (
          <View style={sharedStyles.hoverLabel}>
            <Text style={sharedStyles.hoverLabelText}>Help & Resources</Text>
          </View>
        )}
        <Pressable
          style={sharedStyles.helpButton}
          onPress={onHelpPress}
          onPressIn={onHelpPressIn}
          onPressOut={onHelpPressOut}
        >
          <FontAwesome5 name="question-circle" size={24} color="white" style={{ opacity: 0.6 }} />
          <Text style={sharedStyles.helpLabel}>Help</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default React.memo(BottomTabBar);
