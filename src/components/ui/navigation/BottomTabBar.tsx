import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Colors } from '@/src/constants/theme';
import { sharedStyles } from '../../../styles/sharedStyles';

type TabName = 'home' | 'practice' | 'progress' | 'profile';

interface BottomTabBarProps {
  activeTab: TabName;
}

const TAB_SIZE = 26;
const HELP_SIZE = 24;

const TABS: { name: TabName; icon: keyof typeof Ionicons.glyphMap; label: string; route: string }[] = [
  { name: 'home',     icon: 'home',          label: 'Home',     route: '/home' },
  { name: 'practice', icon: 'musical-notes', label: 'Learn',    route: '/practice' },
  { name: 'progress', icon: 'bar-chart',     label: 'Progress', route: '/progress' },
  { name: 'profile',  icon: 'person',        label: 'Profile',  route: '/profile' },
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

  const onHelpPress = useCallback(() => {
    // TODO: add proper logging and help navigation
  }, []);
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
              <Ionicons
                name={tab.icon}
                size={TAB_SIZE}
                color={Colors.textPrimary}
                style={{ opacity: isActive ? 1 : 0.6 }}
              />
              <Text style={isActive ? sharedStyles.tabTextActive : sharedStyles.tabTextInactive}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

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
          <Ionicons name="help-circle" size={HELP_SIZE} color={Colors.textPrimary} style={{ opacity: 0.6 }} />
          <Text style={sharedStyles.helpLabel}>Help</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default React.memo(BottomTabBar);
