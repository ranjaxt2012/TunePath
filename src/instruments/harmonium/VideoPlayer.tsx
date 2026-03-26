import React, { memo, forwardRef, useImperativeHandle, useRef, useCallback } from 'react';
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

// Format seconds to "m:ss" format
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export interface VideoPlayerHandle {
  seekTo(seconds: number): void;
  pause(): void;
  play(): void;
  setRate(rate: number): void;
  setVolume(volume: number): void;
}

interface VideoPlayerProps {
  source: AVPlaybackSource;
  thumbnailUrl?: string;
  started: boolean;
  onStarted(): void;
  onPlaybackStatus(status: AVPlaybackStatus): void;
  isLandscape: boolean;
  isPlaying: boolean;
  onTogglePlay(): void;
  currentTimeSeconds: number;
  durationSeconds: number;
  onSeek(seconds: number): void;
}



const VideoPlayerInner = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  function VideoPlayerInner(
    { source, thumbnailUrl, started, onStarted, onPlaybackStatus, isLandscape, isPlaying, onTogglePlay, currentTimeSeconds, durationSeconds, onSeek },
    ref
  ) {
    const { theme } = useTheme();
    type VideoNativeRef = React.ComponentRef<typeof Video>;
    const webVideoRef = useRef<HTMLVideoElement | null>(null);
    const nativeVideoRef = useRef<VideoNativeRef | null>(null);

    // YouTube timer refs — tracks notation timer for YouTube lessons
    const ytPlayingRef = React.useRef(false);
    const ytElapsedRef = React.useRef(0);
    const ytTimerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
    const ytStartTimeRef = React.useRef<number | null>(null);

    useImperativeHandle(ref, () => ({
      seekTo: (seconds: number) => {
        try {
          // For YouTube lessons, update the local timer position
          ytElapsedRef.current = seconds;
          ytStartTimeRef.current = Date.now() - seconds * 1000;

          if (Platform.OS === 'web') {
            const el = webVideoRef.current;
            if (el) el.currentTime = seconds;
          } else {
            const v = nativeVideoRef.current;
            if (v) void v.setPositionAsync(seconds * 1000);
          }
        } catch {}
      },

      pause: () => {
        try {
          // Stop YouTube notation timer
          ytPlayingRef.current = false;
          if (ytTimerRef.current) {
            clearInterval(ytTimerRef.current);
            ytTimerRef.current = null;
          }

          if (Platform.OS === 'web') {
            webVideoRef.current?.pause();
          } else {
            void nativeVideoRef.current?.pauseAsync();
          }
        } catch {}
      },

      play: () => {
        try {
          // Start YouTube notation timer
          ytPlayingRef.current = true;
          const offset = ytElapsedRef.current;
          ytStartTimeRef.current = Date.now() - offset * 1000;
          ytTimerRef.current = setInterval(() => {
            if (!ytStartTimeRef.current) return;
            const elapsed = (Date.now() - ytStartTimeRef.current) / 1000;
            ytElapsedRef.current = elapsed;
            onPlaybackStatus({
              isLoaded: true,
              isPlaying: true,
              positionMillis: elapsed * 1000,
              durationMillis: 0,
              rate: 1,
              shouldPlay: true,
              volume: 1,
              isMuted: false,
              isBuffering: false,
              didJustFinish: false,
            } as AVPlaybackStatus);
          }, 100);

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

      setVolume: (volume: number) => {
        try {
          if (Platform.OS === 'web') {
            const el = webVideoRef.current;
            if (el) el.volume = Math.max(0, Math.min(1, volume));
          } else {
            void nativeVideoRef.current?.setVolumeAsync(Math.max(0, Math.min(1, volume)));
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
            onPress={() => {
              onStarted();
              onTogglePlay();
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
            const progressPercent = durationSeconds > 0 ? (currentTimeSeconds / durationSeconds) * 100 : 0;
            return (
              <View style={styles.videoContainer}>
                <View style={styles.youtubeCard}>
                  {thumbnailUrl && (
                    <Image
                      source={{ uri: thumbnailUrl }}
                      style={StyleSheet.absoluteFillObject}
                      resizeMode="cover"
                    />
                  )}
                  <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.4)' }]} />
                  <TouchableOpacity
                    style={styles.watchYouTubeBtn}
                    onPress={() => {
                      if (Platform.OS === 'web') {
                        window.open(videoUrl!, '_blank');
                      } else {
                        void Linking.openURL(videoUrl!);
                      }
                    }}
                  >
                    <Text style={styles.watchYouTubeBtnText}>▶ Watch on YouTube</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={styles.controlsOverlay}
                  onPress={onTogglePlay}
                  activeOpacity={1}
                >
                  <View style={styles.centerIcon}>
                    <Ionicons
                      name={isPlaying ? 'pause-circle' : 'play-circle'}
                      size={64}
                      color="rgba(255,255,255,0.9)"
                    />
                  </View>
                  <View style={[styles.seekBarContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                    <View style={styles.seekBar}>
                      <View
                        style={[
                          styles.seekProgress,
                          {
                            backgroundColor: theme.primary,
                            width: `${progressPercent}%`,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.timeText}>{formatTime(currentTimeSeconds)}</Text>
                    <Text style={styles.timeText}>/</Text>
                    <Text style={styles.timeText}>{formatTime(durationSeconds)}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            );
          }

          return (
            <View style={styles.videoContainer}>
              <video
                ref={webVideoRef}
                src={videoUrl}
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: theme.divider,
                  objectFit: 'contain',
                  display: 'block',
                }}
                onTimeUpdate={(e: React.SyntheticEvent<HTMLVideoElement>) => {
                  const el = e.currentTarget;
                  const currentTime = el.currentTime;
                  const duration = el.duration;
                  onPlaybackStatus({
                    isLoaded: true,
                    isPlaying: !el.paused,
                    positionMillis: currentTime * 1000,
                    durationMillis: Number.isFinite(duration) ? duration * 1000 : 0,
                    rate: 1,
                    shouldPlay: !el.paused,
                    volume: 1,
                    isMuted: false,
                    isBuffering: false,
                    didJustFinish: false,
                  } as AVPlaybackStatus);
                }}
              />
              <TouchableOpacity
                style={styles.controlsOverlay}
                onPress={onTogglePlay}
                activeOpacity={1}
              >
                <View style={styles.centerIcon}>
                  <Ionicons
                    name={isPlaying ? 'pause-circle' : 'play-circle'}
                    size={64}
                    color="rgba(255,255,255,0.9)"
                  />
                </View>
                <View style={[styles.seekBarContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                  <View style={styles.seekBar}>
                    <View
                      style={[
                        styles.seekProgress,
                        {
                          backgroundColor: theme.primary,
                          width: `${Math.max(0, Math.min(100, (currentTimeSeconds / durationSeconds) * 100))}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.timeText}>{formatTime(currentTimeSeconds)}</Text>
                  <Text style={styles.timeText}>/</Text>
                  <Text style={styles.timeText}>{formatTime(durationSeconds)}</Text>
                </View>
              </TouchableOpacity>
            </View>
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
  return (
    p.started === n.started &&
    p.isLandscape === n.isLandscape &&
    p.source === n.source &&
    p.isPlaying === n.isPlaying &&
    p.currentTimeSeconds === n.currentTimeSeconds
  );
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
  videoContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
    zIndex: 0,
  },
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.0)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerIcon: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seekBarContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    gap: Spacing.xs,
  },
  seekBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  seekProgress: {
    height: '100%',
    borderRadius: 2,
  },
  timeText: {
    color: 'white',
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  youtubeCard: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  watchYouTubeBtn: {
    backgroundColor: '#FF0000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    zIndex: 2,
  },
  watchYouTubeBtnText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
});