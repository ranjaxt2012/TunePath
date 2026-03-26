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

    // ── YouTube local timer refs (all outside useImperativeHandle so they
    //    persist across re-renders when onPlaybackStatus prop changes) ──────
    const ytElapsedRef = useRef(0);
    const ytTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const ytStartTimeRef = useRef<number | null>(null);

    // Store onPlaybackStatus in a ref so the setInterval callback always
    // calls the latest version without needing to recreate the interval
    const onPlaybackStatusRef = useRef(onPlaybackStatus);
    React.useLayoutEffect(() => {
      onPlaybackStatusRef.current = onPlaybackStatus;
    });

    // ── Handle ────────────────────────────────────────────────────────────
    useImperativeHandle(ref, () => ({
      seekTo: (seconds: number) => {
        try {
          ytElapsedRef.current = seconds;
          ytStartTimeRef.current = Date.now() - seconds * 1000;
          if (Platform.OS === 'web') {
            const el = webVideoRef.current;
            if (el) el.currentTime = seconds;
          } else {
            void nativeVideoRef.current?.setPositionAsync(seconds * 1000);
          }
        } catch {}
      },

      pause: () => {
        try {
          // Stop YouTube notation timer
          if (ytTimerRef.current) {
            clearInterval(ytTimerRef.current);
            ytTimerRef.current = null;
          }
          // Save elapsed position so resume starts from here
          if (ytStartTimeRef.current !== null) {
            ytElapsedRef.current = (Date.now() - ytStartTimeRef.current) / 1000;
          }
          // Fire one final isPlaying:false status so engine pauses
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

          if (Platform.OS === 'web') {
            webVideoRef.current?.pause();
          } else {
            void nativeVideoRef.current?.pauseAsync();
          }
        } catch {}
      },

      play: () => {
        try {
          // Stop any existing timer before starting a new one
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
            // Always call latest onPlaybackStatus via ref — no stale closure
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
            void nativeVideoRef.current?.setRateAsync(rate, true);
          }
        } catch {}
      },

      setVolume: (volume: number) => {
        try {
          if (Platform.OS === 'web') {
            const el = webVideoRef.current;
            if (el) {
              el.volume = Math.max(0, Math.min(1, volume));
              el.muted = volume === 0;
            }
          } else {
            void nativeVideoRef.current?.setVolumeAsync(Math.max(0, Math.min(1, volume)));
          }
        } catch {}
      },
    }),
    // Empty deps — all refs, no stale closure risk
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []);

    // ── Poster (first tap) ────────────────────────────────────────────────
    if (!started) {
      return (
        <View style={[styles.container, { backgroundColor: theme.divider }, isLandscape && styles.containerLandscape]}>
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
      const videoUrl =
        typeof source === 'object' && source && 'uri' in source
          ? (source as { uri?: string }).uri
          : undefined;
      const isYoutube = videoUrl && isYouTubeUrl(videoUrl);
      const progressPercent =
        durationSeconds > 0 ? Math.max(0, Math.min(100, (currentTimeSeconds / durationSeconds) * 100)) : 0;

      return (
        <View style={[styles.container, { backgroundColor: theme.divider }, isLandscape && styles.containerLandscape]}>
          <View style={styles.videoContainer}>
            {isYoutube ? (
              // YouTube: show thumbnail + Watch button, notation timer runs locally
              <View style={styles.youtubeCard}>
                {thumbnailUrl && (
                  <Image source={{ uri: thumbnailUrl }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
                )}
                <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.4)' }]} />
                <TouchableOpacity
                  style={styles.watchYouTubeBtn}
                  onPress={() => window.open(videoUrl!, '_blank')}
                >
                  <Text style={styles.watchYouTubeBtnText}>▶ Watch on YouTube</Text>
                </TouchableOpacity>
              </View>
            ) : (
              // Regular video
              <video
                ref={webVideoRef}
                src={videoUrl}
                style={{ width: '100%', height: '100%', backgroundColor: theme.divider, objectFit: 'contain', display: 'block' }}
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

            {/* Controls overlay — sits on top of both YouTube card and regular video */}
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

    // ── Native (iOS/Android) ──────────────────────────────────────────────
    const videoUrl =
      typeof source === 'object' && source && 'uri' in source
        ? (source as { uri?: string }).uri
        : undefined;
    const isYoutube = videoUrl && isYouTubeUrl(videoUrl);

    if (isYoutube) {
      // Mobile YouTube: open in YouTube app/browser
      return (
        <View style={[styles.container, { backgroundColor: theme.divider }, isLandscape && styles.containerLandscape]}>
          <TouchableOpacity
            style={[styles.poster, { backgroundColor: theme.surface }]}
            onPress={() => videoUrl && void Linking.openURL(videoUrl)}
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
                  <Ionicons name="logo-youtube" size={48} color="#FF0000" />
                  <Text style={[styles.tapText, { color: theme.textDisabled }]}>Watch on YouTube</Text>
                </View>
              </>
            )}
            <View style={[styles.playBtn, { backgroundColor: '#FF0000' }]}>
              <Ionicons name="logo-youtube" size={24} color="white" />
            </View>
          </TouchableOpacity>
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

// ── memo: only skip re-render when truly nothing visual changed ───────────
// Do NOT return true just because started=true — isPlaying and currentTime
// must still propagate to update the play/pause icon and seek bar.
export const VideoPlayer = memo(VideoPlayerInner, (p, n) => {
  return (
    p.started === n.started &&
    p.isLandscape === n.isLandscape &&
    p.source === n.source &&
    p.isPlaying === n.isPlaying &&
    p.currentTimeSeconds === n.currentTimeSeconds &&
    p.durationSeconds === n.durationSeconds &&
    p.thumbnailUrl === n.thumbnailUrl
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