/**
 * HarmoniumPlayer — thin UI shell over SargamPlayerEngine.
 * All playback logic lives in the engine. This file only renders
 * and forwards user input. No Audio, no fetch, no setTimeout here.
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

// ── Sample map ──────────────────────────────────────────────────────────────
// Keys must match normalized note names (first char upper, rest lower)
// Paths are relative to src/instruments/harmonium/ → assets/ is 3 levels up

const SAMPLE_MAP: Record<string, number> = {
  Sa:  require('../../../assets/instruments/harmonium/samples/Sa.mp3')  as number,
  Re:  require('../../../assets/instruments/harmonium/samples/Re.mp3')  as number,
  Ga:  require('../../../assets/instruments/harmonium/samples/Ga.mp3')  as number,
  Ma:  require('../../../assets/instruments/harmonium/samples/Ma.mp3')  as number,
  Pa:  require('../../../assets/instruments/harmonium/samples/Pa.mp3')  as number,
  Dha: require('../../../assets/instruments/harmonium/samples/Dha.mp3') as number,
  Ni:  require('../../../assets/instruments/harmonium/samples/Ni.mp3')  as number,
};

// ── Helpers ─────────────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function getMockNotes(): Note[] {
  return [
    { note: 'Sa',  time: 0 },
    { note: 'Re',  time: 0.75 },
    { note: 'Ga',  time: 1.5 },
    { note: 'Ma',  time: 2.25 },
    { note: 'Pa',  time: 3 },
    { note: 'Dha', time: 3.75 },
    { note: 'Ni',  time: 4.5 },
    { note: 'Sa',  time: 5.25 },
    { note: 'Re',  time: 6 },
    { note: 'Ga',  time: 6.75 },
    { note: 'Ga',  time: 7.5 },
    { note: 'Ma',  time: 8.25 },
  ];
}

// ── Component ────────────────────────────────────────────────────────────────

export function HarmoniumPlayer({ notes = [], onComplete, onProgress }: LessonPlayerProps) {
  const engineRef = useRef<SargamPlayerEngine | null>(null);

  const [isPlaying, setIsPlaying]           = useState(false);
  const [activeNoteIndex, setActiveNoteIndex] = useState(-1);
  const [bpm, setBpm]                       = useState(80);
  const [trackWidth, setTrackWidth]         = useState(0);
  const [isSeeking, setIsSeeking]           = useState(false);

  const progressAnim          = useRef(new Animated.Value(0)).current;
  const wasPlayingBeforeSeek  = useRef(false);
  const seekRatioRef          = useRef(0);
  const trackWidthRef         = useRef(0);
  const displayNotesRef       = useRef<Note[]>([]);

  // Stable reference so pan handlers never close over stale values
  trackWidthRef.current = trackWidth;

  const displayNotes = notes.length > 0 ? notes : getMockNotes();
  displayNotesRef.current = displayNotes;

  // ── Effect 1: Create engine once on mount ──────────────────────────────────
  useEffect(() => {
    const engine = new SargamPlayerEngine();

    engine.onIndexChange    = (i) => setActiveNoteIndex(i);
    engine.onPlayStateChange = (p) => setIsPlaying(p);
    engine.onComplete       = () => {
      // Engine already reset index to -1; ensure UI + progress reset and notation scrolls to top
      setActiveNoteIndex(-1);
      progressAnim.setValue(0);
    };
    engine.onError          = (e) => { console.error('HarmoniumPlayer engine error:', e); };

    engineRef.current = engine;

    // Configure audio session — allow playback in silent mode
    void Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      allowsRecordingIOS:   false,
      staysActiveInBackground: false,
    });

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  // ── Effect 2: (Re)load engine whenever notes change ────────────────────────
  // Fixes the async-notes bug: if notes arrive after mount, engine reloads.
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    if (displayNotes.length === 0) return;

    engine.load(displayNotes, SAMPLE_MAP);
    setActiveNoteIndex(-1);
    setIsPlaying(false);
  }, [displayNotes]);

  // ── Effect 3: Propagate BPM changes ───────────────────────────────────────
  useEffect(() => {
    engineRef.current?.setBpm(bpm);
  }, [bpm]);

  // ── Effect 4: Animate progress bar ────────────────────────────────────────
  const progress =
    activeNoteIndex < 0
      ? 0
      : activeNoteIndex / Math.max(1, displayNotes.length - 1);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue:         progress,
      duration:        100,
      useNativeDriver: false,
    }).start();
  }, [progress, progressAnim]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handlePlayPause = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    if (engine.isPlaying()) {
      engine.pause();
    } else {
      void engine.play();
    }
  }, []);

  // ── Seek bar (pan responder) ───────────────────────────────────────────────

  const thumbX = progressAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [0, trackWidth],
    extrapolate: 'clamp',
  });

  const seekPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder:  () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: () => true,

      onPanResponderGrant: () => {
        wasPlayingBeforeSeek.current = engineRef.current?.isPlaying() ?? false;
        engineRef.current?.pause();
        setIsSeeking(true);
      },

      onPanResponderMove: (evt) => {
        const w = trackWidthRef.current;
        if (w <= 0) return;

        const raw     = evt.nativeEvent.locationX;
        const clamped = clamp(raw, 0, w);
        const ratio   = w > 0 ? clamped / w : 0;

        // Smoothly update thumb position
        progressAnim.setValue(ratio);

        const total = displayNotesRef.current.length;
        const index = total <= 1 ? 0 : Math.round(ratio * (total - 1));

        seekRatioRef.current = ratio;
        setActiveNoteIndex(index);
      },

      onPanResponderRelease: (evt) => {
        const w = trackWidthRef.current;
        const raw = evt.nativeEvent.locationX;
        const clamped = clamp(raw, 0, w);
        const ratio = w > 0 ? clamped / w : 0;

        seekRatioRef.current = ratio;
        setIsSeeking(false);
        engineRef.current?.seekToRatio(
          seekRatioRef.current,
          wasPlayingBeforeSeek.current,
        );
      },
    }),
  ).current;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      {/* BPM slider */}
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

      {/* Seek / progress bar */}
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

      {/* Notation panel */}
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

// ── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  notationPanelWrap: {
    flex: 1,
  },
  bpmRow: {
    flexDirection:   'row',
    alignItems:      'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginBottom:    Spacing.lg,
  },
  sliderWrap: {
    flex:            1,
    marginHorizontal: Spacing.sm,
    overflow:        'hidden',
  },
  sliderScale: {
    width:      '200%',
    marginLeft: '-50%',
    transform:  [{ scale: 0.5 }],
  },
  slider: {
    flex: 1,
  },
  bpmEmoji: {
    fontSize: FontSize.lg,
  },
  bpmLabel: {
    fontFamily: Typography.semiBold,
    fontSize:   FontSize.sm,
    color:      Colors.textPrimary,
    width:      60,
    textAlign:  'right',
  },
  seekRow: {
    flexDirection:    'row',
    alignItems:       'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical:  Spacing.sm,
    marginBottom:     Spacing.md,
  },
  track: {
    height:           3,
    borderRadius:     Radius.full,
    backgroundColor:  'rgba(255,255,255,0.15)',
    flex:             1,
    marginHorizontal: Spacing.md,
    justifyContent:   'center',
  },
  filled: {
    position:        'absolute',
    left:            0,
    height:          3,
    borderRadius:    Radius.full,
    backgroundColor: Colors.textPrimary,
  },
  thumb: {
    width:           14,
    height:          14,
    borderRadius:    7,
    backgroundColor: Colors.textPrimary,
    position:        'absolute',
    top:             -5.5,
    marginLeft:      -7,
  },
  noteCounter: {
    fontFamily: Typography.regular,
    fontSize:   FontSize.xs,
    color:      Colors.textSecondary,
    width:      40,
    textAlign:  'right',
  },
  loadingWrap: {
    flex:            1,
    alignItems:      'center',
    justifyContent:  'center',
    paddingVertical: Spacing.xxl,
  },
});
