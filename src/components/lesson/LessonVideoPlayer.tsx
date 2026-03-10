/**
 * LessonVideoPlayer - displays and controls video playback
 * Supports: bundled asset (number) or remote URL (string) for R2 streaming
 */

import { useEvent } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect } from 'react';
import { ActivityIndicator, Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

/** Bundled asset id (require()) or remote URL for streaming */
export type VideoSource = number | string;

interface LessonVideoPlayerProps {
  source: VideoSource;
  style?: object;
  thumbnailUrl?: string;
  onTimeUpdate?: (currentTimeSec: number) => void;
  onPlaybackEnd?: () => void;
}

export function LessonVideoPlayer({ source, style, thumbnailUrl, onTimeUpdate, onPlaybackEnd }: LessonVideoPlayerProps) {
  const player = useVideoPlayer(source, (p) => {
    p.loop = false;
    p.timeUpdateEventInterval = 0.25; // ~4 updates/sec for sargam sync
  });

  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });
  const { status } = useEvent(player, 'statusChange', { status: player.status });
  const isReady = status === 'readyToPlay';

  const togglePlayPause = () => {
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  };

  useEffect(() => {
    const sub = player.addListener('timeUpdate', ({ currentTime }) => {
      onTimeUpdate?.(currentTime);
    });
    return () => sub.remove();
  }, [player, onTimeUpdate]);

  useEffect(() => {
    if (!onPlaybackEnd) return;
    const sub = player.addListener('playToEnd', onPlaybackEnd);
    return () => sub.remove();
  }, [player, onPlaybackEnd]);

  return (
    <View style={[styles.container, style]}>
      {thumbnailUrl && !isReady && (
        <Image
          source={{ uri: thumbnailUrl }}
          style={[StyleSheet.absoluteFillObject, styles.thumbnailPlaceholder]}
          resizeMode="cover"
        />
      )}
      {!isReady && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading video...</Text>
        </View>
      )}
      <VideoView
        player={player}
        style={styles.video}
        contentFit="contain"
        nativeControls={false}
      />
      <Pressable
        style={({ pressed }) => [styles.playButton, { opacity: pressed ? 0.8 : 1 }]}
        onPress={togglePlayPause}
      >
        <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  video: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  playButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    ...(Platform.OS === 'android' && { elevation: 8 }),
  },
  playIcon: {
    fontSize: 22,
    color: '#FFFFFF',
  },
  thumbnailPlaceholder: {
    zIndex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  loadingText: {
    color: '#fff',
    marginTop: 8,
    fontSize: 14,
  },
});
