/**
 * HarmoniumPlayer — thin UI over SargamPlayerEngine.
 * All playback logic lives in the engine; this only renders and forwards input.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  PanResponder,
} from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { Colors, FontSize, Radius, Spacing, Typography } from '@/src/constants/theme';
import { ScrollingNotation } from './ScrollingNotation';
import { SargamPlayerEngine } from './SargamPlayerEngine';
import type { LessonPlayerProps } from '@/src/registry/types';
import type { Note } from '@/src/utils/notation';

const SAMPLE_MAP: Record<string, number> = {
  Sa: require('../../assets/instruments/harmonium/samples/Sa.mp3') as number,
  Re: require('../../assets/instruments/harmonium/samples/Re.mp3') as number,
  Ga: require('../../assets/instruments/harmonium/samples/Ga.mp3') as number,
  Ma: require('../../assets/instruments/harmonium/samples/Ma.mp3') as number,
  Pa: require('../../assets/instruments/harmonium/samples/Pa.mp3') as number,
  Dha: require('../../assets/instruments/harmonium/samples/Dha.mp3') as number,
  Ni: require('../../assets/instruments/harmonium/samples/Ni.mp3') as number,
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function HarmoniumPlayer({ lesson, notes = [], onComplete, onProgress }: LessonPlayerProps) {
  const engineRef = useRef<SargamPlayerEngine | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeNoteIndex, setActiveNoteIndex] = useState(-1);
  const [bpm, setBpm] = useState(80);
  const [trackWidth, setTrackWidth] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const lastSeekRatioRef = useRef(0);
  const trackWidthRef = useRef(0);
  const displayNotesRef = useRef<Note[]>([]);
  const wasPlayingBeforeSeekRef = useRef(false);
  const isPlayingRef = useRef(false);
  isPlayingRef.current = isPlaying;

  const displayNotes = notes.length > 0 ? notes : getMockNotes();
  displayNotesRef.current = displayNotes;
  trackWidthRef.current = trackWidth;

  useEffect(() => {
    const engine = new SargamPlayerEngine();
    engine.onIndexChange = (i) => setActiveNoteIndex(i);
    engine.onPlayStateChange = (p) => setIsPlaying(p);
    engine.onComplete = () => {};
    engine.load(displayNotes, SAMPLE_MAP);

    void Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
    });

    engineRef.current = engine;
    return () => engine.destroy();
  }, []);

  useEffect(() => {
    engineRef.current?.setBpm(bpm);
  }, [bpm]);

  const thumbX = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, trackWidth],
    extrapolate: 'clamp',
  });

  const progress =
    activeNoteIndex < 0
      ? 0
      : activeNoteIndex / Math.max(1, displayNotes.length - 1);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 100,
      useNativeDriver: false,
    }).start();
  }, [progress, progressAnim]);

  const handlePlayPause = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    if (isPlaying) {
      engine.pause();
    } else {
      void engine.play();
    }
  }, [isPlaying]);

  const seekPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        wasPlayingBeforeSeekRef.current = isPlayingRef.current;
        engineRef.current?.pause();
        const w = trackWidthRef.current;
        const ratio = w > 0 ? clamp(evt.nativeEvent.locationX / w, 0, 1) : 0;
        const total = displayNotesRef.current.length;
        const index = total <= 1 ? 0 : Math.round(ratio * (total - 1));
        lastSeekRatioRef.current = ratio;
        setActiveNoteIndex(index);
      },
      onPanResponderMove: (evt) => {
        const w = trackWidthRef.current;
        if (w <= 0) return;
        const ratio = clamp(evt.nativeEvent.locationX / w, 0, 1);
        const total = displayNotesRef.current.length;
        const index =
          total <= 1
            ? 0
            : Math.min(total - 1, Math.max(0, Math.round(ratio * (total - 1))));
        lastSeekRatioRef.current = ratio;
        setActiveNoteIndex(index);
      },
      onPanResponderRelease: () => {
        engineRef.current?.seekToRatio(
          lastSeekRatioRef.current,
          wasPlayingBeforeSeekRef.current
        );
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <View style={styles.bpmRow}>
        <Text style={styles.bpmEmoji}>🐢</Text>
        <View style={styles.sliderWrap}>
          <View style={styles.sliderScale}>
            <Slider
              style={styles.slider}
              minimumValue={40}
              maximumValue={160}
              step={5}
              value={bpm}
              onValueChange={(val) => setBpm(val)}
              minimumTrackTintColor={Colors.bgPrimary}
              maximumTrackTintColor="rgba(255,255,255,0.2)"
              thumbTintColor={Colors.textPrimary}
            />
          </View>
        </View>
        <Text style={styles.bpmEmoji}>🐇</Text>
        <Text style={styles.bpmLabel}>{Math.round(bpm)} BPM</Text>
      </View>

      <View style={styles.seekRow}>
        <TouchableOpacity
          onPress={handlePlayPause}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={20}
            color={Colors.textPrimary}
          />
        </TouchableOpacity>
        <View
          {...seekPan.panHandlers}
          onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
          style={styles.track}
        >
          <Animated.View style={[styles.filled, { width: thumbX }]} />
          <Animated.View style={[styles.thumb, { transform: [{ translateX: thumbX }] }]} />
        </View>
        <Text style={styles.noteCounter}>
          {Math.max(0, activeNoteIndex + 1)} / {displayNotes.length}
        </Text>
      </View>

      {displayNotes.length > 0 ? (
        <View style={styles.notationPanelWrap}>
          <ScrollingNotation
            notes={displayNotes}
            activeNoteIndex={activeNoteIndex}
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

function getMockNotes(): Note[] {
  return [
    { note: 'Sa', time: 0 },
    { note: 'Re', time: 0.75 },
    { note: 'Ga', time: 1.5 },
    { note: 'Ma', time: 2.25 },
    { note: 'Pa', time: 3 },
    { note: 'Dha', time: 3.75 },
    { note: 'Ni', time: 4.5 },
    { note: 'Sa', time: 5.25 },
    { note: 'Re', time: 6 },
    { note: 'Ga', time: 6.75 },
    { note: 'Ga', time: 7.5 },
    { note: 'Ma', time: 8.25 },
  ];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  notationPanelWrap: {
    flex: 1,
  },
  bpmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  sliderWrap: {
    flex: 1,
    marginHorizontal: Spacing.sm,
    overflow: 'hidden',
  },
  sliderScale: {
    width: '200%',
    marginLeft: '-50%',
    transform: [{ scale: 0.5 }],
  },
  slider: {
    flex: 1,
  },
  bpmEmoji: {
    fontSize: 20,
  },
  bpmLabel: {
    fontFamily: Typography.semiBold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    width: 60,
    textAlign: 'right',
  },
  seekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
  },
  track: {
    height: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.15)',
    flex: 1,
    marginHorizontal: Spacing.md,
    justifyContent: 'center',
  },
  filled: {
    position: 'absolute',
    left: 0,
    height: 3,
    borderRadius: 999,
    backgroundColor: Colors.textPrimary,
  },
  thumb: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.textPrimary,
    position: 'absolute',
    top: -5.5,
    marginLeft: -7,
  },
  noteCounter: {
    fontFamily: Typography.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    width: 40,
    textAlign: 'right',
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
});
