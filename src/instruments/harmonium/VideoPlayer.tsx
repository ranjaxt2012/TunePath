import React, { memo } from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode, AVPlaybackStatus, AVPlaybackSource } from 'expo-av';

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
  return (
    <View style={[styles.container, isLandscape && styles.containerLandscape]}>
      {!started ? (
        <TouchableOpacity
          style={styles.posterContainer}
          onPress={onStarted}
          activeOpacity={0.9}
        >
          {thumbnailUrl ? (
            <Image
              source={{ uri: thumbnailUrl }}
              style={StyleSheet.absoluteFillObject}
              resizeMode="cover"
            />
          ) : (
            <View style={[StyleSheet.absoluteFillObject, styles.posterPlaceholder]} />
          )}
          <View style={[StyleSheet.absoluteFillObject, styles.posterOverlay]} />
          <View style={styles.posterPlayBtn}>
            <Ionicons name="play" size={36} color="rgba(255,255,255,0.95)" />
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
    backgroundColor: '#000',
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
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  posterPlaceholder: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  posterOverlay: {
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  posterPlayBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  video: {
    width: '100%',
    height: '100%',
    flex: 1,
  },
});
