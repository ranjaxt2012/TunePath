/**
 * LessonVideoPlayer - displays and controls video playback
 * Uses expo-video with custom play/pause button
 */

import { useEvent } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

interface LessonVideoPlayerProps {
  source: number;
  style?: object;
  onTimeUpdate?: (currentTimeSec: number) => void;
}

export function LessonVideoPlayer({ source, style, onTimeUpdate }: LessonVideoPlayerProps) {
  const player = useVideoPlayer(source, (p) => {
    p.loop = false;
    p.timeUpdateEventInterval = 0.25; // ~4 updates/sec for sargam sync
  });

  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });

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

  return (
    <View style={[styles.container, style]}>
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
});
