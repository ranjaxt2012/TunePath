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
  setVolume(volume: number): void;
}

interface VideoPlayerProps {
  source: AVPlaybackSource;
  thumbnailUrl?: string;
  started: boolean;
  onStarted(): void;
  onPlaybackStatus(status: AVPlaybackStatus): void;
  isLandscape: boolean;
}


// Handle exported by YouTubePlayer via forwardRef
interface YouTubePlayerHandle {
  pause(): void;
  play(): void;
  seekTo(seconds: number): void;
}

// YouTube player controlled via postMessage — no native controls
const YouTubePlayer = forwardRef<
  YouTubePlayerHandle,
  {
    videoId: string;
    onPlaybackStatus: (s: AVPlaybackStatus) => void;
    onStarted: () => void;
  }
>(function YouTubePlayer({ videoId, onPlaybackStatus, onStarted }, ref) {
  const iframeRef = React.useRef<HTMLIFrameElement | null>(null);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = React.useRef<number | null>(null);
  const pausedAtRef = React.useRef<number | null>(null);
  const iframeReadyRef = React.useRef(false);
  const pendingPlayRef = React.useRef(false);

  // Helper to send commands to YouTube iframe via postMessage
  function sendCommand(func: string, args: unknown[] = []) {
    if (!iframeReadyRef.current) return;
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func, args }),
      '*'
    );
  }

  // Called when iframe finishes loading
  function handleIframeLoad() {
    iframeReadyRef.current = true;
    // If play was called before iframe was ready, execute it now
    if (pendingPlayRef.current) {
      pendingPlayRef.current = false;
      startTimer();
    }
  }

  // stopTimer function — sends pauseVideo, clears interval, fires isPlaying:false
  const stopTimer = React.useCallback(() => {
    sendCommand('pauseVideo');
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (startTimeRef.current !== null) {
      pausedAtRef.current = (Date.now() - startTimeRef.current) / 1000;
    }
    onPlaybackStatus({
      isLoaded: true,
      isPlaying: false,
      positionMillis: (pausedAtRef.current ?? 0) * 1000,
      durationMillis: 0,
      rate: 1,
      shouldPlay: false,
      volume: 1,
      isMuted: false,
      isBuffering: false,
      didJustFinish: false,
    } as AVPlaybackStatus);
  }, [onPlaybackStatus]);

  // startTimer function — sends playVideo, startserval from pausedAt position
  const startTimer = React.useCallback(() => {
    if (!iframeReadyRef.current) {
      pendingPlayRef.current = true;
      return;
    }
    sendCommand('playVideo');
    if (timerRef.current) return;
    const offset = pausedAtRef.current ?? 0;
    startTimeRef.current = Date.now() - offset * 1000;
    timerRef.current = setInterval(() => {
      if (startTimeRef.current === null) return;
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
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
  }, [onPlaybackStatus]);

  useImperativeHandle(
    ref,
    () => ({
      pause: stopTimer,
      play: startTimer,
      seekTo: (seconds: number) => {
        sendCommand('seekTo', [seconds, true]);
        pausedAtRef.current = seconds;
        startTimeRef.current = Date.now() - seconds * 1000;
      },
    }),
    [stopTimer, startTimer]
  );

  // No autostart — wait for parent to call play()
  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <iframe
      ref={iframeRef}
      width="100%"
      height="100%"
      src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=0&controls=0&disablekb=1&rel=0&modestbranding=1`}
      frameBorder="0"
      onLoad={handleIframeLoad}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      style={{
        width: '100%',
        height: '100%',
        border: 'none',
        display: 'block',
      } as React.CSSProperties}
    />
  );
});

const VideoPlayerInner = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  function VideoPlayerInner(
    { source, thumbnailUrl, started, onStarted, onPlaybackStatus, isLandscape },
    ref
  ) {
    const { theme } = useTheme();
    type VideoNativeRef = React.ComponentRef<typeof Video>;
    const webVideoRef = useRef<HTMLVideoElement | null>(null);
    const nativeVideoRef = useRef<VideoNativeRef | null>(null);
    const youtubeRef = useRef<YouTubePlayerHandle | null>(null);

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
          youtubeRef.current?.pause();
          if (Platform.OS === 'web') {
            webVideoRef.current?.pause();
          } else {
            void nativeVideoRef.current?.pauseAsync();
          }
        } catch {}
      },

      play: () => {
        try {
          youtubeRef.current?.play();
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
              // For YouTube: start the timer + send playVideo command
              youtubeRef.current?.play();
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
            const videoId = getYouTubeVideoId(videoUrl);
            return (
              <YouTubePlayer
                ref={youtubeRef}
                videoId={videoId!}
                onPlaybackStatus={onPlaybackStatus}
                onStarted={onStarted}
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