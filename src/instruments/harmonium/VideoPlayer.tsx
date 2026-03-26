import React, { memo, forwardRef, useImperativeHandle, useRef } from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet, Platform, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Video, ResizeMode } from 'expo-av';
import type { AVPlaybackSource, AVPlaybackStatus } from 'expo-av';
import { useTheme, Spacing, FontSize } from '@/src/design';

// Helper to extract YouTube video ID from various YouTube URL formats
function getYouTubeVideoId(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/|shorts\/)([A-Za-z0-9_-]{11})/);
  return match ? match[1] : null;
}

// Check if a URL is a YouTube URL
function isYouTubeUrl(url: string): boolean {
  return /(?:youtube\.com|youtu\.be)/.test(url);
}

export interface VideoPlayerHandle {
  seekTo(seconds: number): void;
  pause(): void;
  play(): void;
  setRate(rate: number): void;
}

interface VideoPlayerProps {
  source: AVPlaybackSource;
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
    type VideoNativeRef = React.ComponentRef<typeof Video>;
    const webVideoRef = useRef<HTMLVideoElement | null>(null);
    const nativeVideoRef = useRef<VideoNativeRef | null>(null);

    useImperativeHandle(ref, () => ({
      seekTo: (seconds: number) => {
        try {
          if (Platform.OS === 'web') {
            const el = webVideoRef.current;
            if (!el) return;
            el.currentTime = seconds;
          } else {
            const v = nativeVideoRef.current;
            if (!v) return;
            void v.setPositionAsync(seconds * 1000);
          }
        } catch {}
      },

      pause: () => {
        try {
          if (Platform.OS === 'web') {
            webVideoRef.current?.pause();
          } else {
            void nativeVideoRef.current?.pauseAsync();
          }
        } catch {}
      },

      play: () => {
        try {
          if (Platform.OS === 'web') {
            void webVideoRef.current?.play();
          } else {
            void nativeVideoRef.current?.playAsync();
          }
        } catch {}
      },

      setRate: (rate: number) => {
        try {
          if (Platform.OS === 'web') {
            const el = webVideoRef.current;
            if (el) el.playbackRate = rate;
          } else {
            // shouldCorrectPitch=true keeps pitch natural at slow speeds
            void nativeVideoRef.current?.setRateAsync(rate, true);
          }
        } catch {}
      },
    }));

    return (
      <View
        style={[
          styles.container,
          { backgroundColor: theme.divider },
          isLandscape && styles.containerLandscape,
        ]}
      >
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
                <View
                  style={[
                    StyleSheet.absoluteFillObject,
                    { backgroundColor: theme.overlay, opacity: 0.33 },
                  ]}
                />
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
                style={{ marginLeft: Spacing.xs }}
              />
            </View>
          </TouchableOpacity>
        ) : Platform.OS === 'web' ? (() => {
          const videoUrl =
            typeof source === 'object' && source && 'uri' in source
              ? (source as { uri?: string }).uri
              : undefined;
          const isYoutube = videoUrl && isYouTubeUrl(videoUrl);

          if (isYoutube) {
            const videoId = getYouTubeVideoId(videoUrl);
            return (
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1`}
                frameBorder="0"
                allowFullScreen
                style={{ border: 'none' }}
              />
            );
          }

          return (
            <video
              ref={webVideoRef}
              src={videoUrl}
              controls
              autoPlay
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: theme.divider,
                objectFit: 'contain',
              }}
              onTimeUpdate={(e: React.SyntheticEvent<HTMLVideoElement>) => {
                const el = e.currentTarget;
                const currentTime = el.currentTime;
                const duration = el.duration;
                onPlaybackStatus({
                  isLoaded: true,
                  isPlaying: true,
                  positionMillis: currentTime * 1000,
                  durationMillis: Number.isFinite(duration) ? duration * 1000 : 0,
                  rate: 1,
                  shouldPlay: true,
                  volume: 1,
                  isMuted: false,
                  isBuffering: false,
                  didJustFinish: false,
                } as AVPlaybackStatus);
              }}
            />
          );
        })() : (() => {
          const videoUrl =
            typeof source === 'object' && source && 'uri' in source
              ? (source as { uri?: string }).uri
              : undefined;
          const isYoutube = videoUrl && isYouTubeUrl(videoUrl);

          if (isYoutube) {
            return (
              <TouchableOpacity
                style={[styles.poster, { backgroundColor: theme.surface }]}
                onPress={() => {
                  if (videoUrl) {
                    void Linking.openURL(videoUrl);
                  }
                }}
                activeOpacity={0.9}
              >
                {thumbnailUrl ? (
                  <>
                    <Image
                      source={{ uri: thumbnailUrl }}
                      style={StyleSheet.absoluteFillObject}
                      resizeMode="cover"
                    />
                    <View
                      style={[
                        StyleSheet.absoluteFillObject,
                        { backgroundColor: theme.overlay, opacity: 0.33 },
                      ]}
                    />
                  </>
                ) : (
                  <>
                    <LinearGradient
                      colors={[theme.surfaceHigh, theme.background]}
                      style={StyleSheet.absoluteFill}
                    />
                    <View style={styles.placeholder}>
                      <Ionicons name="musical-notes" size={48} color={theme.textDisabled} />
                      <Text style={[styles.tapText, { color: theme.textDisabled }]}>
                        Watch on YouTube
                      </Text>
                    </View>
                  </>
                )}
                <View style={[styles.playBtn, { backgroundColor: theme.primary }]}>
                  <Ionicons
                    name="play"
                    size={28}
                    color={theme.textOnPrimary}
                    style={{ marginLeft: Spacing.xs }}
                  />
                </View>
              </TouchableOpacity>
            );
          }

          return (
            <Video
              ref={nativeVideoRef}
              source={source}
              style={styles.video}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay={false}
              useNativeControls
              onPlaybackStatusUpdate={onPlaybackStatus}
            />
          );
        })()}
      </View>
    );
  }
);

export const VideoPlayer = memo(VideoPlayerInner, (p, n) => {
  if (p.started && n.started) return true;
  return p.started === n.started && p.isLandscape === n.isLandscape && p.source === n.source;
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 16 / 9,
    overflow: 'hidden',
  },
  containerLandscape: {
    flex: 1,
    width: undefined,
    aspectRatio: undefined,
    alignSelf: 'stretch',
  },
  poster: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholder: { alignItems: 'center', gap: Spacing.sm },
  tapText: { fontSize: FontSize.sm, fontWeight: '500' },
  playBtn: {
    position: 'absolute',
    width: Spacing.xxxl + Spacing.xl,
    height: Spacing.xxxl + Spacing.xl,
    borderRadius: (Spacing.xxxl + Spacing.xl) / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  video: { width: '100%', height: '100%', flex: 1 },
});