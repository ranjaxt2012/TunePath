import React, { memo } from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Video, ResizeMode, AVPlaybackStatus, AVPlaybackSource } from 'expo-av';
import { useTheme, Spacing, FontSize } from '@/src/design';

interface VideoPlayerProps {
  source: AVPlaybackSource;
  thumbnailUrl?: string;
  started: boolean;
  onStarted: () => void;
  onPlaybackStatus: (s: AVPlaybackStatus) => void;
  isLandscape: boolean;
}

function VideoPlayerComponent({
  source,
  thumbnailUrl,
  started,
  onStarted,
  onPlaybackStatus,
  isLandscape,
}: VideoPlayerProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, isLandscape && styles.containerLandscape]}>
      {!started ? (
        <TouchableOpacity
          style={[styles.posterContainer, { backgroundColor: theme.surface }]}
          onPress={onStarted}
          activeOpacity={0.9}
        >
          {thumbnailUrl ? (
            <>
              {/* Thumbnail image */}
              <Image
                source={{ uri: thumbnailUrl }}
                style={StyleSheet.absoluteFillObject}
                resizeMode="cover"
              />
              {/* Dim overlay so play button is visible */}
              <View style={styles.thumbnailOverlay} />
            </>
          ) : (
            <>
              {/* Gradient placeholder */}
              <LinearGradient
                colors={[theme.surfaceHigh, theme.background]}
                style={StyleSheet.absoluteFill}
              />
              {/* Music note + tap label */}
              <View style={styles.placeholderContent}>
                <Ionicons name="musical-notes" size={48} color={theme.textDisabled} />
                <Text style={[styles.placeholderText, { color: theme.textDisabled }]}>
                  Tap to play
                </Text>
              </View>
            </>
          )}

          {/* Play button — same design for both states */}
          <View style={[styles.playBtn, { backgroundColor: theme.primary }]}>
            <Ionicons
              name="play"
              size={28}
              color={theme.textOnPrimary}
              style={{ marginLeft: 3 }}
            />
          </View>
        </TouchableOpacity>
      ) : (
        <Video
          source={source}
          style={styles.video}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={false}
          useNativeControls
          onPlaybackStatusUpdate={onPlaybackStatus}
        />
      )}
    </View>
  );
}

function areEqual(prev: VideoPlayerProps, next: VideoPlayerProps) {
  return (
    prev.started === next.started &&
    prev.isLandscape === next.isLandscape &&
    prev.source === next.source
  );
}

export const VideoPlayer = memo(VideoPlayerComponent, areEqual);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
  containerLandscape: {
    flex: 1,
    width: undefined,
    aspectRatio: undefined,
    alignSelf: 'stretch',
  },
  posterContainer: {
    width: '100%',
    height: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  placeholderContent: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  placeholderText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  playBtn: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  video: {
    width: '100%',
    height: '100%',
    flex: 1,
  },
});
