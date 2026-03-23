import React, { memo, forwardRef, useImperativeHandle, useRef } from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Video, ResizeMode } from 'expo-av';
import type { AVPlaybackStatus } from 'expo-av';
import { useTheme, Spacing, FontSize } from '@/src/design';

export interface VideoPlayerHandle {
  seekTo(seconds: number): void;
}

interface VideoPlayerProps {
  source: any;
  thumbnailUrl?: string;
  started: boolean;
  onStarted(): void;
  onPlaybackStatus(status: AVPlaybackStatus): void;
  isLandscape: boolean;
}

const VideoPlayerInner = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  function VideoPlayerInner(
    { source, thumbnailUrl, started, onStarted, onPlaybackStatus, isLandscape },
    ref
  ) {
    const { theme } = useTheme();
    const nativeVideoRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      seekTo: (seconds: number) => {
        if (!nativeVideoRef.current) return;
        try {
          if (Platform.OS === 'web') {
            nativeVideoRef.current.currentTime = seconds;
          } else {
            nativeVideoRef.current.setPositionAsync(seconds * 1000);
          }
        } catch {}
      },
    }));

    return (
      <View style={[styles.container, isLandscape && styles.containerLandscape]}>
        {!started ? (
          <TouchableOpacity
            style={[styles.poster, { backgroundColor: theme.surface }]}
            onPress={onStarted}
            activeOpacity={0.9}
          >
            {thumbnailUrl ? (
              <>
                <Image
                  source={{ uri: thumbnailUrl }}
                  style={StyleSheet.absoluteFillObject}
                  resizeMode="cover"
                />
                <View style={styles.thumbOverlay} />
              </>
            ) : (
              <>
                <LinearGradient
                  colors={[theme.surfaceHigh, theme.background]}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.placeholder}>
                  <Ionicons name="musical-notes" size={48} color={theme.textDisabled} />
                  <Text style={[styles.tapText, { color: theme.textDisabled }]}>Tap to play</Text>
                </View>
              </>
            )}
            <View style={[styles.playBtn, { backgroundColor: theme.primary }]}>
              <Ionicons
                name="play"
                size={28}
                color={theme.textOnPrimary}
                style={{ marginLeft: 3 }}
              />
            </View>
          </TouchableOpacity>
        ) : Platform.OS === 'web' ? (
          <video
            ref={nativeVideoRef}
            src={
              typeof source === 'object' && source && 'uri' in source
                ? (source as { uri?: string }).uri
                : undefined
            }
            controls
            autoPlay
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#000',
              objectFit: 'contain',
            } as any}
            onTimeUpdate={(e: any) => {
              const currentTime = (e.target as HTMLVideoElement).currentTime;
              const duration = (e.target as HTMLVideoElement).duration;
              onPlaybackStatus({
                isLoaded: true,
                isPlaying: true,
                positionMillis: currentTime * 1000,
                durationMillis: duration ? duration * 1000 : 0,
                rate: 1,
                shouldPlay: true,
                volume: 1,
                isMuted: false,
                isBuffering: false,
                didJustFinish: false,
              } as any);
            }}
          />
        ) : (
          <Video
            ref={nativeVideoRef}
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
);

export const VideoPlayer = memo(VideoPlayerInner, (p, n) => {
  // Once started, never re-render video from parent state changes
  if (p.started && n.started) return true;
  return p.started === n.started && p.isLandscape === n.isLandscape && p.source === n.source;
});

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
  poster: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  thumbOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  } as any,
  placeholder: { alignItems: 'center', gap: Spacing.sm },
  tapText: { fontSize: FontSize.sm, fontWeight: '500' },
  playBtn: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  video: { width: '100%', height: '100%', flex: 1 },
});
