/**
 * HarmoniumPlayer — video-driven notation. Video is source of truth;
 * notation syncs to video position every 100ms. Engine syncToTime() replaces ticker.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  TouchableOpacity,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Colors, FontSize, Radius, Spacing, Typography } from '@/src/constants/theme';
import { formatTime } from '@/src/utils/time';
import { ScrollingNotation } from './ScrollingNotation';
import { SargamPlayerEngine } from './SargamPlayerEngine';
import type { LessonPlayerProps } from '@/src/registry/types';
import type { Note } from '@/src/utils/notation';

const MOCK_VIDEO_URL =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

const SAMPLE_MAP: Record<string, number> = {
  Sa:  require('../../../assets/instruments/harmonium/samples/Sa.mp3')  as number,
  Re:  require('../../../assets/instruments/harmonium/samples/Re.mp3')  as number,
  Ga:  require('../../../assets/instruments/harmonium/samples/Ga.mp3')  as number,
  Ma:  require('../../../assets/instruments/harmonium/samples/Ma.mp3')  as number,
  Pa:  require('../../../assets/instruments/harmonium/samples/Pa.mp3')  as number,
  Dha: require('../../../assets/instruments/harmonium/samples/Dha.mp3') as number,
  Ni:  require('../../../assets/instruments/harmonium/samples/Ni.mp3')  as number,
};

function getMockNotes(): Note[] {
  return [
    { note: 'Sa',  time: 2.0  },
    { note: 'Re',  time: 4.0  },
    { note: 'Ga',  time: 6.0  },
    { note: 'Ma',  time: 8.0  },
    { note: 'Pa',  time: 10.0 },
    { note: 'Dha', time: 12.0 },
    { note: 'Ni',  time: 14.0 },
    { note: 'Sa',  time: 16.0 },
    { note: 'Ni',  time: 18.0 },
    { note: 'Dha', time: 20.0 },
    { note: 'Pa',  time: 22.0 },
    { note: 'Ma',  time: 24.0 },
  ];
}

export function HarmoniumPlayer({ lesson, notes = [], onComplete, onProgress }: LessonPlayerProps) {
  const engineRef = useRef<SargamPlayerEngine | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const [activeNoteIndex, setActiveNoteIndex] = useState(-1);
  const [noteProgress, setNoteProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [showControls, setShowControls] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const controlsOpacity = useRef(new Animated.Value(0)).current;
  const hideControlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const displayNotesRef = useRef<Note[]>([]);

  const videoSource = lesson.video_url ?? MOCK_VIDEO_URL;
  const player = useVideoPlayer(videoSource, (p) => {
    p.loop = false;
    p.playbackRate = playbackSpeed;
  });

  const displayNotes = notes.length > 0 ? notes : getMockNotes();
  displayNotesRef.current = displayNotes;

  useEffect(() => {
    const engine = new SargamPlayerEngine();
    engine.onIndexChange = (i) => setActiveNoteIndex(i);
    engine.onNoteProgress = (p) => setNoteProgress(p);
    engine.onComplete = () => {
      setActiveNoteIndex(-1);
      progressAnim.setValue(0);
      onCompleteRef.current?.();
    };
    engine.onError = (e) => { /* no-op or log */ };
    engineRef.current = engine;
    void Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
    });
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    if (displayNotes.length === 0) return;
    engine.load(displayNotes, SAMPLE_MAP);
    setActiveNoteIndex(-1);
  }, [displayNotes]);

  useEffect(() => {
    player.playbackRate = playbackSpeed;
  }, [playbackSpeed, player]);

  useEffect(() => {
    const interval = setInterval(() => {
      const position = player.currentTime ?? 0;
      engineRef.current?.syncToTime(position, playbackSpeed);
      const duration = player.duration ?? 1;
      const ratio = duration > 0 ? position / duration : 0;
      progressAnim.setValue(ratio);
    }, 100);
    return () => clearInterval(interval);
  }, [player, progressAnim, playbackSpeed]);

  useEffect(() => {
    const sub = player.addListener('playingChange', ({ isPlaying: playing }) => {
      setIsPlaying(playing);
    });
    return () => sub.remove();
  }, [player]);

  useEffect(() => {
    const sub = player.addListener('playToEnd', () => {
      setActiveNoteIndex(-1);
      progressAnim.setValue(0);
      engineRef.current?.onComplete?.();
    });
    return () => sub.remove();
  }, [player]);

  const showVideoControls = useCallback(() => {
    if (hideControlsTimer.current) {
      clearTimeout(hideControlsTimer.current);
      hideControlsTimer.current = null;
    }
    setShowControls(true);
    Animated.timing(controlsOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    hideControlsTimer.current = setTimeout(() => {
      Animated.timing(controlsOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowControls(false));
      hideControlsTimer.current = null;
    }, 3000);
  }, [controlsOpacity]);

  const handleVideoTap = useCallback(() => {
    showVideoControls();
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  }, [player, showVideoControls]);

  useEffect(() => {
    return () => {
      if (hideControlsTimer.current) {
        clearTimeout(hideControlsTimer.current);
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.videoContainer}>
        <VideoView
          player={player}
          style={styles.video}
          allowsFullscreen
          allowsPictureInPicture
          nativeControls={false}
        />

        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={handleVideoTap}
          activeOpacity={1}
        />

        {showControls && (
          <Animated.View
            style={[styles.controlsOverlay, { opacity: controlsOpacity }]}
            pointerEvents="none"
          >
            <View style={styles.controlsGradient} />
            <View style={styles.centerControl}>
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={48}
                color="rgba(255,255,255,0.95)"
              />
            </View>
            <View style={styles.videoProgress}>
              <View style={styles.videoProgressTrack}>
                <Animated.View
                  style={[
                    styles.videoProgressFill,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
              </View>
              <Text style={styles.videoTime}>
                {formatTime(player.currentTime ?? 0)} / {formatTime(player.duration ?? 0)}
              </Text>
            </View>
          </Animated.View>
        )}
      </View>

      <View style={styles.speedRow}>
        <Text style={styles.speedEmoji}>🐢</Text>
        <Slider
          style={styles.speedSlider}
          minimumValue={0.25}
          maximumValue={2.0}
          step={0.05}
          value={playbackSpeed}
          onValueChange={(val) => {
            setPlaybackSpeed(Math.round(val * 20) / 20);
          }}
          minimumTrackTintColor={Colors.bgPrimary}
          maximumTrackTintColor="rgba(255,255,255,0.2)"
          thumbTintColor={Colors.textPrimary}
        />
        <Text style={styles.speedEmoji}>🐇</Text>
        <Text style={styles.speedLabel}>
          {playbackSpeed.toFixed(2)}x
        </Text>
      </View>

      {displayNotes.length > 0 ? (
        <View style={styles.notationPanelWrap}>
          <ScrollingNotation
            notes={displayNotes}
            activeNoteIndex={activeNoteIndex}
            noteProgress={noteProgress}
          />
        </View>
      ) : (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color={Colors.textSecondary} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlsGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  centerControl: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoProgress: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.lg,
    right: Spacing.lg,
  },
  videoProgressTrack: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 999,
    overflow: 'hidden' as const,
    marginBottom: Spacing.xs,
  },
  videoProgressFill: {
    height: '100%',
    backgroundColor: Colors.textPrimary,
    borderRadius: 999,
  },
  videoTime: {
    fontFamily: Typography.regular,
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'right',
  },
  speedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  speedSlider: {
    flex: 1,
    marginHorizontal: Spacing.sm,
  },
  speedEmoji: {
    fontSize: 18,
  },
  speedLabel: {
    fontFamily: Typography.semiBold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    width: 48,
    textAlign: 'right',
  },
  notationPanelWrap: {
    flex: 1,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
});
