import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenGradient } from '@/src/components/common/ScreenGradient';
import { BottomTabBar } from '@/src/components/ui';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useAuthStore } from '@/src/store/authStore';
import { Spacing, Radius, TextPresets, CommonStyles } from '@/src/constants/theme';
import { postToAPI } from '@/src/services/apiClient';

export default function TutorApplyScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const [tutorStatus, setTutorStatus] = useState<string>('none');
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setTutorStatus(user.tutor_status || 'none');
    }
  }, [user]);

  const handleApply = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await postToAPI('/tutor/apply', {});
      setTutorStatus('pending');
      setApplied(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply');
    } finally {
      setLoading(false);
    }
  };

  // If already a tutor, redirect to upload
  if (tutorStatus === 'approved') {
    router.replace('/tutor/upload');
    return null;
  }

  const statusMessageMap = {
    pending: 'Application Under Review',
    rejected: 'Application Not Approved',
    approved: 'You are a Tutor!',
    none: 'Not Applied Yet',
  };

  const statusDescriptionMap = {
    pending: 'We are reviewing your application. This usually takes 1-2 business days.',
    rejected: 'Your application was not approved at this time. Contact support for details.',
    approved: 'Congratulations! You can now upload lessons.',
    none: 'Share your knowledge and earn from your content.',
  };

  return (
    <ScreenGradient style={[CommonStyles.screen]}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            padding: Spacing.lg,
            paddingTop: Spacing.xl,
            paddingBottom: 100,
            alignItems: 'center',
          }}
        >
          {/* Header */}
          <Text style={[TextPresets.displayMd, { color: theme.textPrimary, marginBottom: Spacing.md }]}>
            Become a Tutor
          </Text>

          {/* Icon */}
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: theme.cardBg,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: Spacing.xl,
            }}
          >
            <Ionicons name="school-outline" size={40} color={theme.bgPrimary} />
          </View>

          {/* Description */}
          <Text
            style={[
              TextPresets.bodyMd,
              {
                color: theme.textSecondary,
                textAlign: 'center',
                marginBottom: Spacing.xl,
              },
            ]}
          >
            {statusDescriptionMap[tutorStatus as keyof typeof statusDescriptionMap] ||
              'Share your knowledge with students worldwide'}
          </Text>

          {/* Features */}
          {tutorStatus === 'none' && (
            <View style={{ width: '100%', marginBottom: Spacing.xl }}>
              {[
                { icon: 'cloud-upload-outline', text: 'Upload your lessons' },
                { icon: 'people-outline', text: 'Reach thousands of students' },
                { icon: 'sparkles-outline', text: 'AI generates notation' },
                { icon: 'wallet-outline', text: 'Earn from your content' },
              ].map((feature, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: Spacing.md,
                  }}
                >
                  <Ionicons name={feature.icon as any} size={20} color={theme.success} />
                  <Text
                    style={[
                      TextPresets.bodyMd,
                      {
                        color: theme.textPrimary,
                        marginLeft: Spacing.md,
                      },
                    ]}
                  >
                    {feature.text}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Status Display */}
          {tutorStatus !== 'none' && (
            <View
              style={{
                width: '100%',
                backgroundColor: theme.cardBg,
                borderRadius: Radius.lg,
                padding: Spacing.lg,
                marginBottom: Spacing.xl,
                alignItems: 'center',
              }}
            >
              <Text
                style={[
                  TextPresets.h2,
                  {
                    color:
                      tutorStatus === 'approved'
                        ? theme.success
                        : tutorStatus === 'rejected'
                          ? theme.error
                          : theme.textPrimary,
                    marginBottom: Spacing.sm,
                  },
                ]}
              >
                {statusMessageMap[tutorStatus as keyof typeof statusMessageMap]}
              </Text>
              <Text
                style={[
                  TextPresets.caption,
                  {
                    color: theme.textSecondary,
                    textAlign: 'center',
                  },
                ]}
              >
                Status: <Text style={{ fontWeight: '600' }}>{tutorStatus}</Text>
              </Text>
            </View>
          )}

          {/* Error Message */}
          {error && (
            <View
              style={{
                width: '100%',
                backgroundColor: 'rgba(239,68,68,0.2)',
                borderRadius: Radius.md,
                padding: Spacing.md,
                marginBottom: Spacing.lg,
              }}
            >
              <Text style={[TextPresets.bodyMd, { color: theme.error }]}>{error}</Text>
            </View>
          )}

          {/* Success Message */}
          {applied && (
            <View
              style={{
                width: '100%',
                backgroundColor: 'rgba(16,185,129,0.2)',
                borderRadius: Radius.md,
                padding: Spacing.md,
                marginBottom: Spacing.lg,
              }}
            >
              <Text style={[TextPresets.bodyMd, { color: theme.success }]}>
                ✅ Application received! We'll review it shortly.
              </Text>
            </View>
          )}

          {/* Apply Button */}
          {tutorStatus === 'none' && !applied && (
            <Pressable
              style={({ pressed }) => [
                {
                  width: '100%',
                  backgroundColor: theme.bgPrimary,
                  paddingVertical: Spacing.lg,
                  borderRadius: Radius.lg,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              onPress={handleApply}
              disabled={loading}
            >
              <Text
                style={[
                  TextPresets.labelLg,
                  {
                    color: '#FFFFFF',
                  },
                ]}
              >
                {loading ? 'Applying...' : 'Apply to Become a Tutor'}
              </Text>
            </Pressable>
          )}

          {/* Pending Action */}
          {tutorStatus === 'pending' && (
            <Pressable
              style={({ pressed }) => [
                {
                  width: '100%',
                  backgroundColor: theme.cardBg,
                  paddingVertical: Spacing.lg,
                  borderRadius: Radius.lg,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: pressed ? 0.8 : 1,
                  borderWidth: 1,
                  borderColor: theme.borderColor,
                },
              ]}
              onPress={() => {}} // Refresh status
            >
              <Text
                style={[
                  TextPresets.labelLg,
                  {
                    color: theme.textPrimary,
                  },
                ]}
              >
                Check Status
              </Text>
            </Pressable>
          )}

          {/* Rejected Action */}
          {tutorStatus === 'rejected' && (
            <Pressable
              style={({ pressed }) => [
                {
                  width: '100%',
                  backgroundColor: theme.cardBg,
                  paddingVertical: Spacing.lg,
                  borderRadius: Radius.lg,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: pressed ? 0.8 : 1,
                  borderWidth: 1,
                  borderColor: theme.borderColor,
                },
              ]}
              onPress={() => {}} // Contact support
            >
              <Text
                style={[
                  TextPresets.labelLg,
                  {
                    color: theme.textPrimary,
                  },
                ]}
              >
                Contact Support
              </Text>
            </Pressable>
          )}
        </ScrollView>
      </SafeAreaView>

      <BottomTabBar activeTab="profile" />
    </ScreenGradient>
  );
}
