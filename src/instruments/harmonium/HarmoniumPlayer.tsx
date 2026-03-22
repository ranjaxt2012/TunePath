/**
 * HarmoniumPlayer — refactored with VideoPlayer and NotationContainer memos.
 * VideoPlayer never re-renders from notation state changes.
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { setAudioModeAsync } from 'expo-audio';
import { AVPlaybackStatus } from 'expo-av';
import { useTheme } from '@/src/design';
import { FontSize, Spacing } from '@/src/constants/theme';
import { useAuthStore } from '@/src/store/authStore';
import { useProgressStore } from '@/src/store/progressStore';
import { VideoPlayer } from './VideoPlayer';
import { NotationContainer } from './NotationContainer';
import { SargamPlayerEngine } from './SargamPlayerEngine';
import { HARMONIUM_SAMPLE_MAP } from './sampleMap';
import type { LessonPlayerProps } from '@/src/registry/types';
import type { Note } from '@/src/utils/notation';

const MOCK_VIDEO_URL = require('../../../assets/instruments/harmonium/test_lesson.mp4');
const SAVE_INTERVAL_MS = 10_000;

function getMockNotes(): Note[] {
  const sections: { notation: string; startSec: number; endSec: number }[] = [
    { notation: 'Sa Re Ga Ma Pa Dha Ni Sa', startSec: 0, endSec: 12 },
    { notation: 'Sa Ni Dha Pa Ma Ga Re Sa', startSec: 13, endSec: 24 },
    { notation: 'Sa Sa Re Re Ga Ga Ma Ma Pa Pa Dha Dha Ni Ni Sa', startSec: 25, endSec: 38 },
  ];
  const notes: Note[] = [];
  for (const sec of sections) {
    const tokens = sec.notation.split(/\s+/).map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase());
    if (tokens.length === 0) continue;
    const step = (sec.endSec - sec.startSec) / tokens.length;
    tokens.forEach((token, i) => {
      notes.push({ note: token, time: sec.startSec + (i + 0.5) * step });
    });
  }
  return notes;
}

export function HarmoniumPlayer({ lesson, notes = [], onComplete }: LessonPlayerProps) {
  const user = useAuthStore((s) => s.user);
  const isTutor = user?.roles?.includes('tutor') ?? false;
  const { theme } = useTheme();
  const { savePosition, getPosition } = useProgressStore();

  const engineRef = useRef<SargamPlayerEngine | null>(null);
  const videoRef = useRef<any>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const lastSyncRef = useRef(0);
  const lastSaveRef = useRef(0);

  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [videoStarted, setVideoStarted] = useState(false);
  const [localNotes, setLocalNotes] = useState<Note[]>([]);

  // Orientation from window dimensions
  const [isLandscape, setIsLandscape] = useState(false);
  useEffect(() => {
    const { width, height } = require('react-native').Dimensions.get('window');
    setIsLandscape(width > height);
    const sub = require('react-native').Dimensions.addEventListener('change', ({ window }: any) => {
      setIsLandscape(window.width > window.height);
    });
    return () => sub?.remove();
  }, []);

  const isWeb = Platform.OS === 'web';
  const showSideBySide = isLandscape || isWeb;

  const videoSource = lesson.video_url ? { uri: lesson.video_url } : MOCK_VIDEO_URL;

  const mockNotes = useMemo(() => getMockNotes(), []);
  const displayNotes = useMemo(() => (notes.length > 0 ? notes : mockNotes), [notes, mockNotes]);
  const activeNotes = useMemo(() => (localNotes.length > 0 ? localNotes : displayNotes), [localNotes, displayNotes]);

  // Init engine
  useEffect(() => {
    const engine = new SargamPlayerEngine();
    engine.onComplete = () => { onCompleteRef.current?.(); };
    engine.onError = () => {};
    engineRef.current = engine;
    void setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false, shouldPlayInBackground: false });
    return () => { engine.destroy(); engineRef.current = null; };
  }, []);

  // Load notes into engine
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine || activeNotes.length === 0) return;
    engine.load(activeNotes, HARMONIUM_SAMPLE_MAP);
  }, [activeNotes]);

  // Sync playback speed
  useEffect(() => {
    videoRef.current?.setRateAsync?.(playbackSpeed, true);
  }, [playbackSpeed]);

  // Resume from saved position
  const handleVideoStarted = useCallback(() => {
    setVideoStarted(true);
    const savedPos = getPosition(lesson.id);
    if (savedPos > 0) {
      setTimeout(() => {
        videoRef.current?.setPositionAsync?.(savedPos * 1000);
      }, 500);
    }
  }, [lesson.id, getPosition]);

  const handleNotesEdit = useCallback((updated: Note[]) => {
    setLocalNotes(updated);
  }, []);

  const handlePlaybackStatus = useCallback(
    (status: AVPlaybackStatus) => {
      if (!status.isLoaded || !status.isPlaying) return;

      const now = Date.now();
      // Throttle engine sync to 100ms
      if (now - lastSyncRef.current >= 100) {
        lastSyncRef.current = now;
        const currentTime = status.positionMillis / 1000;
        engineRef.current?.syncToTime(currentTime, playbackSpeed);
      }

      // Save position every 10 seconds
      if (now - lastSaveRef.current >= SAVE_INTERVAL_MS) {
        lastSaveRef.current = now;
        const posSeconds = status.positionMillis / 1000;
        savePosition(lesson.id, posSeconds);
      }
    },
    [playbackSpeed, lesson.id, savePosition]
  );

  return (
    <View style={[styles.container, showSideBySide && styles.containerLandscape]}>
      {/* Video section */}
      <View style={[styles.videoSection, showSideBySide && styles.videoSectionLandscape]}>
        <VideoPlayer
          source={videoSource}
          thumbnailUrl={lesson.thumbnail_url ?? undefined}
          started={videoStarted}
          onStarted={handleVideoStarted}
          onPlaybackStatus={handlePlaybackStatus}
          isLandscape={showSideBySide}
        />
      </View>

      {/* Dividers */}
      {!showSideBySide && <View style={styles.sectionDivider} />}
      {showSideBySide && <View style={styles.verticalDivider} />}

      {/* Right panel */}
      <View style={[styles.rightPanel, showSideBySide && styles.rightPanelLandscape]}>
        {/* Speed slider */}
        <View style={[styles.speedRow, { borderTopColor: theme.border }]}>
          <Text style={styles.speedEmoji}>🐢</Text>
          <Slider
            style={styles.speedSlider}
            minimumValue={0.25}
            maximumValue={2.0}
            step={0.05}
            value={playbackSpeed}
            onValueChange={(val) => setPlaybackSpeed(Math.round(val * 20) / 20)}
            minimumTrackTintColor={theme.primary}
            maximumTrackTintColor={theme.border}
            thumbTintColor="#FFFFFF"
          />
          <Text style={styles.speedEmoji}>🐇</Text>
          <Text style={[styles.speedLabel, { color: theme.textPrimary }]}>
            {playbackSpeed.toFixed(2)}x
          </Text>
        </View>

        {/* Notation */}
        <NotationContainer
          engineRef={engineRef}
          notes={activeNotes}
          isTutor={isTutor}
          onNotesEdit={handleNotesEdit}
          isLandscape={showSideBySide}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  containerLandscape: {
    flexDirection: 'row',
  },
  videoSection: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000000',
    overflow: 'hidden',
    minHeight: 200,
  },
  videoSectionLandscape: {
    flex: 1,
    width: undefined,
    aspectRatio: undefined,
    alignSelf: 'stretch',
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
  sectionDivider: {
    width: '100%',
    height: 6,
    backgroundColor: '#000000',
  },
  verticalDivider: {
    width: 6,
    height: '100%',
    backgroundColor: '#000000',
  },
  rightPanel: {
    flex: 1,
    flexDirection: 'column',
  },
  rightPanelLandscape: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  speedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
  },
  speedSlider: {
    flex: 1,
    marginHorizontal: Spacing.sm,
  },
  speedEmoji: { fontSize: 18 },
  speedLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    width: 48,
    textAlign: 'right',
  },
});
