import React, { memo, forwardRef, useImperativeHandle, useRef } from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet, Platform, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Video, ResizeMode } from 'expo-av';
import type { AVPlaybackSource, AVPlaybackStatus } from 'expo-av';
import { useTheme, Spacing, FontSize } from '@/src/design';

function getYouTubeVideoId(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/|shorts\/)([A-Za-z0-9_-]{11})/);
  return match ? match[1] : null;
}

function isYouTubeUrl(url: string): boolean {
  return /(?:youtube\.com|youtu\.be)/.test(url);
}

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
  function VideoPlayerInner(props, ref) {
    const {
      source, thumbnailUrl, started, onStarted, onPlaybackStatus,
      isLandscape, isPlaying, onTogglePlay, currentTimeSeconds, durationSeconds,
    } = props;

    const { theme } = useTheme();
    type VideoNativeRef = React.ComponentRef<typeof Video>;
    const webVideoRef = useRef<HTMLVideoElement | null>(null);
    const nativeVideoRef = useRef<VideoNativeRef | null>(null);

    // ── YouTube-only timer refs ───────────────────────────────────────────
    // These only run when source URL is a YouTube URL.
    // For R2 videos, time comes from onTimeUpdate — no timer needed.
    const ytElapsedRef = useRef(0);
    const ytTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const ytStartTimeRef = useRef<number | null>(null);

    // ── Always-current ref for onPlaybackStatus ──────────────────────────
    // Prevents stale closure inside setInterval without recreating the interval.
    const onPlaybackStatusRef = useRef(onPlaybackStatus);
    React.useLayoutEffect(() => {
      onPlaybackStatusRef.current = onPlaybackStatus;
    });

    // ── Determine if source is YouTube ────────────────────────────────────
    const sourceUrl =
      typeof source === 'object' && source && 'uri' in source
        ? (source as { uri?: string }).uri ?? ''
        : '';
    const isYoutube = isYouTubeUrl(sourceUrl);

    // ── Handle ────────────────────────────────────────────────────────────
    useImperativeHandle(ref, () => ({
      seekTo: (seconds: number) => {
        try {
          if (isYoutube) {
            ytElapsedRef.current = seconds;
            if (ytStartTimeRef.current !== null) {
              ytStartTimeRef.current = Date.now() - seconds * 1000;
            }
          } else if (Platform.OS === 'web') {
            const el = webVideoRef.current;
            if (el) el.currentTime = seconds;
          } else {
            void nativeVideoRef.current?.setPositionAsync(seconds * 1000);
          }
        } catch { /* noop */ }
      },

      pause: () => {
        try {
          if (isYoutube) {
            // Stop YouTube notation timer and save position
            if (ytTimerRef.current) {
              clearInterval(ytTimerRef.current);
              ytTimerRef.current = null;
            }
            if (ytStartTimeRef.current !== null) {
              ytElapsedRef.current = (Date.now() - ytStartTimeRef.current) / 1000;
              ytStartTimeRef.current = null;
            }
            // Fire isPlaying:false so engine pauses
            onPlaybackStatusRef.current({
              isLoaded: true,
              isPlaying: false,
              positionMillis: ytElapsedRef.current * 1000,
              durationMillis: 0,
              rate: 1,
              shouldPlay: false,
              volume: 1,
              isMuted: false,
              isBuffering: false,
              didJustFinish: false,
            } as AVPlaybackStatus);
          } else if (Platform.OS === 'web') {
            webVideoRef.current?.pause();
          } else {
            void nativeVideoRef.current?.pauseAsync();
          }
        } catch { /* noop */ }
      },

      play: () => {
        try {
          if (isYoutube) {
            // Stop any existing timer first
            if (ytTimerRef.current) {
              clearInterval(ytTimerRef.current);
              ytTimerRef.current = null;
            }
            // Resume from saved position
            const offset = ytElapsedRef.current;
            ytStartTimeRef.current = Date.now() - offset * 1000;

            ytTimerRef.current = setInterval(() => {
              if (ytStartTimeRef.current === null) return;
              const elapsed = (Date.now() - ytStartTimeRef.current) / 1000;
              ytElapsedRef.current = elapsed;
              onPlaybackStatusRef.current({
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
          } else if (Platform.OS === 'web') {
            void webVideoRef.current?.play();
          } else {
            void nativeVideoRef.current?.playAsync();
          }
        } catch { /* noop */ }
      },

      setRate: (rate: number) => {
        try {
          if (!isYoutube) {
            if (Platform.OS === 'web') {
              const el = webVideoRef.current;
              if (el) el.playbackRate = rate;
            } else {
              void nativeVideoRef.current?.setRateAsync(rate, true);
            }
          }
        } catch { /* noop */ }
      },

      setVolume: (volume: number) => {
        try {
          if (!isYoutube) {
            if (Platform.OS === 'web') {
              const el = webVideoRef.current;
              if (el) {
                el.volume = Math.max(0, Math.min(1, volume));
                el.muted = volume === 0;
              }
            } else {
              void nativeVideoRef.current?.setVolumeAsync(Math.max(0, Math.min(1, volume)));
            }
          }
        } catch { /* noop */ }
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []); // empty deps — all refs, no stale closure

    // ── Poster (before first play) ────────────────────────────────────────
    if (!started) {
      return (
        <View style={[styles.container, { backgroundColor: theme.divider }, isLandscape && styles.containerLandscape]}>
          <TouchableOpacity
            style={[styles.poster, { backgroundColor: theme.surface }]}
            onPress={() => {
              // onStarted mounts the video element (sets started=true)
              // onTogglePlay starts playback — for R2 videos the element
              // isn't mounted yet so we give React one frame to mount it
              onStarted();
              if (isYoutube) {
                // YouTube has no real video element — toggle immediately
                onTogglePlay();
              } else {
                // R2 video: wait one frame for the video element to mount
                requestAnimationFrame(() => onTogglePlay());
              }
            }}
            activeOpacity={0.9}
          >
            {thumbnailUrl ? (
              <>
                <Image source={{ uri: thumbnailUrl }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
                <View style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.overlay, opacity: 0.33 }]} />
              </>
            ) : (
              <>
                <LinearGradient colors={[theme.surfaceHigh, theme.background]} style={StyleSheet.absoluteFill} />
                <View style={styles.placeholder}>
                  <Ionicons name="musical-notes" size={48} color={theme.textDisabled} />
                  <Text style={[styles.tapText, { color: theme.textDisabled }]}>Tap to play</Text>
                </View>
              </>
            )}
            <View style={[styles.playBtn, { backgroundColor: theme.primary }]}>
              <Ionicons name="play" size={28} color={theme.textOnPrimary} style={{ marginLeft: Spacing.xs }} />
            </View>
          </TouchableOpacity>
        </View>
      );
    }

    // ── Web platform ──────────────────────────────────────────────────────
    if (Platform.OS === 'web') {
      const progressPercent =
        durationSeconds > 0
          ? Math.max(0, Math.min(100, (currentTimeSeconds / durationSeconds) * 100))
          : 0;

      return (
        <View style={[styles.container, { backgroundColor: theme.divider }, isLandscape && styles.containerLandscape]}>
          <View style={styles.videoContainer}>
            {isYoutube ? (
              // YouTube: thumbnail + Watch on YouTube button
              // Notation timer runs locally and independently
              <View style={styles.youtubeCard}>
                {thumbnailUrl ? (
                  <Image source={{ uri: thumbnailUrl }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
                ) : (
                  <LinearGradient colors={[theme.surfaceHigh, theme.background]} style={StyleSheet.absoluteFill} />
                )}
                <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.45)' }]} />
                <View style={styles.youtubeHint}>
                  <Ionicons name="logo-youtube" size={18} color="white" style={{ marginRight: 6 }} />
                  <Text style={styles.youtubeHintText}>Notation is playing</Text>
                </View>
              </View>
            ) : (
              // R2 video — HTML video element, time from onTimeUpdate
              <video
                ref={webVideoRef}
                src={sourceUrl}
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: theme.divider,
                  objectFit: 'contain',
                  display: 'block',
                }}
                onTimeUpdate={(e: React.SyntheticEvent<HTMLVideoElement>) => {
                  const el = e.currentTarget;
                  onPlaybackStatusRef.current({
                    isLoaded: true,
                    isPlaying: !el.paused,
                    positionMillis: el.currentTime * 1000,
                    durationMillis: Number.isFinite(el.duration) ? el.duration * 1000 : 0,
                    rate: 1,
                    shouldPlay: !el.paused,
                    volume: 1,
                    isMuted: false,
                    isBuffering: false,
                    didJustFinish: false,
                  } as AVPlaybackStatus);
                }}
              />
            )}

            {/* Controls overlay — play/pause icon + seek bar */}
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
                  <View style={[styles.seekProgress, { backgroundColor: theme.primary, width: `${progressPercent}%` }]} />
                </View>
                <Text style={styles.timeText}>{formatTime(currentTimeSeconds)}</Text>
                <Text style={styles.timeText}>/</Text>
                <Text style={styles.timeText}>{formatTime(durationSeconds || 0)}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // ── Native (iOS / Android) ────────────────────────────────────────────
    if (isYoutube) {
      return (
        <View style={[styles.container, { backgroundColor: theme.divider }, isLandscape && styles.containerLandscape]}>
          <View style={styles.videoContainer}>
            <View style={styles.youtubeCard}>
              {thumbnailUrl ? (
                <Image source={{ uri: thumbnailUrl }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
              ) : (
                <LinearGradient colors={[theme.surfaceHigh, theme.background]} style={StyleSheet.absoluteFill} />
              )}
              <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.45)' }]} />
              <View style={styles.youtubeHint}>
                <Ionicons name="musical-notes" size={16} color="rgba(255,255,255,0.8)" />
                <Text style={styles.youtubeHintText}>Notation is playing</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.controlsOverlay} onPress={onTogglePlay} activeOpacity={1}>
              <View style={styles.centerIcon}>
                <Ionicons name={isPlaying ? 'pause-circle' : 'play-circle'} size={64} color="rgba(255,255,255,0.9)" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.container, { backgroundColor: theme.divider }, isLandscape && styles.containerLandscape]}>
        <Video
          ref={nativeVideoRef}
          source={source}
          style={styles.video}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={false}
          useNativeControls
          onPlaybackStatusUpdate={(status) => onPlaybackStatusRef.current(status)}
        />
      </View>
    );
  }
);

// ── memo: compare only what actually affects rendering ────────────────────
// Never short-circuit with `return true` — that blocks isPlaying updates
export const VideoPlayer = memo(VideoPlayerInner, (p, n) => {
  return (
    p.started === n.started &&
    p.isLandscape === n.isLandscape &&
    p.source === n.source &&
    p.isPlaying === n.isPlaying &&
    p.currentTimeSeconds === n.currentTimeSeconds &&
    p.durationSeconds === n.durationSeconds &&
    p.thumbnailUrl === n.thumbnailUrl &&
    p.onTogglePlay === n.onTogglePlay
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
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  video: { width: '100%', height: '100%', flex: 1 },
  videoContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
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
  youtubeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 2,
  },
  youtubeHintText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '500',
  },
});