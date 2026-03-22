import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Slider from '@react-native-community/slider';
import { useTheme, Spacing, FontSize } from '@/src/design';
import { useProgressStore } from '@/src/store/progressStore';
import { VideoPlayer } from './VideoPlayer';
import { NotationContainer } from './NotationContainer';
import { SargamPlayerEngine, type Note } from './SargamPlayerEngine';
import { HARMONIUM_SAMPLE_MAP } from './sampleMap';
import type { Lesson } from '@/src/types/models';
import type { AVPlaybackStatus } from 'expo-av';
import { useOrientation } from '@/src/hooks/useOrientation';
import { Log } from '@/src/utils/log';

interface HarmoniumPlayerProps {
  lesson: Lesson;
  notes?: Note[];
  onComplete?(): void;
}

const MOCK_VIDEO_URL = require('../../../assets/instruments/harmonium/test_lesson.mp4');

export function HarmoniumPlayer({ lesson, notes = [], onComplete }: HarmoniumPlayerProps) {
  const { theme } = useTheme();
  const { isLandscape } = useOrientation();
  const isWeb = Platform.OS === 'web';
  const showSideBySide = isLandscape || isWeb;

  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [videoStarted, setVideoStarted] = useState(false);

  const engineRef = useRef<SargamPlayerEngine | null>(null);
  const lastSyncRef = useRef<number>(0);
  const lastSaveRef = useRef<number>(0);

  const savePosition = useProgressStore((s) => s.savePosition);
  const getPosition = useProgressStore((s) => s.getPosition);

  const videoSource = useMemo(
    () => (lesson.video_url ? { uri: lesson.video_url } : MOCK_VIDEO_URL),
    [lesson.video_url]
  );

  // Init engine
  useEffect(() => {
    const engine = new SargamPlayerEngine();
    engine.load(notes, HARMONIUM_SAMPLE_MAP);
    engine.onComplete = () => {
      onComplete?.();
    };
    engineRef.current = engine;

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload notes when they change
  useEffect(() => {
    if (engineRef.current && notes.length > 0) {
      engineRef.current.load(notes, HARMONIUM_SAMPLE_MAP);
    }
  }, [notes]);

  const handleVideoStarted = useCallback(() => {
    setVideoStarted(true);
    Log.player('video started');
    // Restore saved position — videoRef would seek here if exposed
    const savedPosition = getPosition(lesson.id);
    // Position restore is handled via native controls once video is playing
    void savedPosition;
  }, [getPosition, lesson.id]);

  const handlePlaybackStatus = useCallback(
    (status: AVPlaybackStatus) => {
      if (!status.isLoaded) return;

      const now = Date.now();
      const positionSecs = (status.positionMillis ?? 0) / 1000;

      // Throttle engine sync to ~100ms
      if (now - lastSyncRef.current >= 100) {
        lastSyncRef.current = now;
        engineRef.current?.syncToTime(positionSecs, playbackSpeed);
        Log.player('position', { currentTime: positionSecs });
      }

      // Save position every ~10s
      if (now - lastSaveRef.current >= 10_000) {
        lastSaveRef.current = now;
        savePosition(lesson.id, positionSecs);
      }

      if (!status.isPlaying && videoStarted) {
        Log.playerWarn('unexpected pause');
      }
    },
    [lesson.id, playbackSpeed, savePosition]
  );

  const handleNotesEdit = useCallback((updatedNotes: Note[]) => {
    // Stub: reload engine with updated notes
    engineRef.current?.load(updatedNotes, HARMONIUM_SAMPLE_MAP);
  }, []);

  const speedLabel = playbackSpeed.toFixed(2).replace(/\.?0+$/, '') + 'x';

  const speedSlider = (
    <View style={styles.sliderRow}>
      <Text style={styles.sliderEmoji}>🐢</Text>
      <Slider
        style={styles.slider}
        minimumValue={0.25}
        maximumValue={2.0}
        step={0.05}
        value={playbackSpeed}
        onValueChange={setPlaybackSpeed}
        minimumTrackTintColor={theme.primary}
        maximumTrackTintColor={theme.border}
        thumbTintColor="#FFFFFF"
      />
      <Text style={styles.sliderEmoji}>🐇</Text>
      <Text style={[styles.speedLabel, { color: theme.textSecondary }]}>{speedLabel}</Text>
    </View>
  );

  const notationPanel = (
    <NotationContainer
      engineRef={engineRef}
      notes={notes}
      isTutor={false}
      onNotesEdit={handleNotesEdit}
      isLandscape={showSideBySide}
    />
  );

  if (showSideBySide) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Video side */}
        <View style={styles.sideBySideVideo}>
          <VideoPlayer
            source={videoSource}
            thumbnailUrl={lesson.thumbnail_url ?? undefined}
            started={videoStarted}
            onStarted={handleVideoStarted}
            onPlaybackStatus={handlePlaybackStatus}
            isLandscape
          />
        </View>

        {/* 6px black vertical divider */}
        <View style={styles.verticalDivider} />

        {/* Notation side */}
        <View style={styles.sideBySideNotation}>
          {speedSlider}
          {notationPanel}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Video (16:9) */}
      <VideoPlayer
        source={videoSource}
        thumbnailUrl={lesson.thumbnail_url ?? undefined}
        started={videoStarted}
        onStarted={handleVideoStarted}
        onPlaybackStatus={handlePlaybackStatus}
        isLandscape={false}
      />

      {/* 6px black horizontal divider */}
      <View style={styles.horizontalDivider} />

      {/* Speed slider */}
      {speedSlider}

      {/* Notation (flex 1) */}
      {notationPanel}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  horizontalDivider: {
    width: '100%',
    height: 6,
    backgroundColor: '#000000',
  },
  verticalDivider: {
    width: 6,
    alignSelf: 'stretch',
    backgroundColor: '#000000',
  },
  sideBySideVideo: {
    flex: 1,
  },
  sideBySideNotation: {
    flex: 1,
  },
  sliderRow: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
  },
  sliderEmoji: {
    fontSize: 16,
  },
  slider: {
    flex: 1,
  },
  speedLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    minWidth: 36,
    textAlign: 'right',
  },
});
