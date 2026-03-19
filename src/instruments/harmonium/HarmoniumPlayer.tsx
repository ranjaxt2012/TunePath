/**
 * HarmoniumPlayer — video-driven notation. Video is source of truth;
 * notation syncs to video position via onPlaybackStatusUpdate. Engine syncToTime() replaces ticker.
 */

import { useTheme } from '@/src/contexts/ThemeContext';
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { setAudioModeAsync } from 'expo-audio';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { FontSize, Spacing, Typography } from '@/src/constants/theme';
import { useAuthStore } from '@/src/store/authStore';
import { ScrollingNotation } from './ScrollingNotation';
import { SargamPlayerEngine } from './SargamPlayerEngine';
import { HARMONIUM_SAMPLE_MAP } from './sampleMap';
import type { LessonPlayerProps } from '@/src/registry/types';
import type { Note } from '@/src/utils/notation';

const MOCK_VIDEO_URL = require('../../../assets/instruments/harmonium/test_lesson.mp4');

/**
 * Mock notation for "Introduction to Sa re ga ma" / Basic Sargam when
 * lesson has no notation_url or fetch returns empty. Matches
 * content/harmonium/beginner/lesson-001-basics-sargam/lesson.json:
 * Section 1 (0–12s) straight scale, Section 2 (13–24s) reverse, Section 3 (25–38s) double notes.
 */
function getMockNotes(): Note[] {
  const sections: { notation: string; startSec: number; endSec: number }[] = [
    { notation: 'Sa Re Ga Ma Pa Dha Ni Sa', startSec: 0, endSec: 12 },
    { notation: 'Sa Ni Dha Pa Ma Ga Re Sa', startSec: 13, endSec: 24 },
    {
      notation: 'Sa Sa Re Re Ga Ga Ma Ma Pa Pa Dha Dha Ni Ni Sa',
      startSec: 25,
      endSec: 38,
    },
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

export function HarmoniumPlayer({
  lesson,
  notes = [],
  onComplete,
}: LessonPlayerProps) {
  const user = useAuthStore((s) => s.user);
  const isTutor = user?.roles?.includes('tutor') ?? false;
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const engineRef = useRef<SargamPlayerEngine | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const videoRef = useRef<Video>(null);

  const [activeNoteIndex, setActiveNoteIndex] = useState(-1);
  const [noteProgress, setNoteProgress] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [videoStarted, setVideoStarted] = useState(false);
  const [localNotes, setLocalNotes] = useState<Note[]>([]);

  const videoSource = lesson.video_url
    ? { uri: lesson.video_url }
    : MOCK_VIDEO_URL;

  const mockNotes = useMemo(() => getMockNotes(), []);
  const displayNotes = useMemo(
    () => (notes.length > 0 ? notes : mockNotes),
    [notes, mockNotes]
  );
  const activeNotes = useMemo(
    () => (localNotes.length > 0 ? localNotes : displayNotes),
    [localNotes, displayNotes]
  );

  useEffect(() => {
    const engine = new SargamPlayerEngine();
    engine.onIndexChange = (i) => setActiveNoteIndex(i);
    engine.onNoteProgress = (p) => setNoteProgress(p);
    engine.onComplete = () => {
      setActiveNoteIndex(-1);
      onCompleteRef.current?.();
    };
    engine.onError = (_e) => { /* no-op */ };
    engineRef.current = engine;
    void setAudioModeAsync({
      playsInSilentMode: true,
      allowsRecording: false,
      shouldPlayInBackground: false,
    });
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- engine init once on mount

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    if (activeNotes.length === 0) return;
    engine.load(activeNotes, HARMONIUM_SAMPLE_MAP);
    setActiveNoteIndex(-1);
  }, [activeNotes]);

  const handleNotesEdit = useCallback((updated: Note[]) => {
    setLocalNotes(updated);
    // TODO: PATCH /api/lessons/${lesson.id}/notation with updated notes
  }, []);

  const handlePlaybackStatus = useCallback(
    (status: AVPlaybackStatus) => {
      if (!status.isLoaded || !status.isPlaying) return;

      const currentTime = status.positionMillis / 1000;
      engineRef.current?.syncToTime(currentTime, playbackSpeed);
    },
    [playbackSpeed]
  );

  // Keep playback rate in sync with speed slider
  useEffect(() => {
    videoRef.current?.setRateAsync(playbackSpeed, true);
  }, [playbackSpeed]);

  return (
    <View style={[styles.container, isLandscape && styles.containerLandscape]}>
      {/* Video section */}
      <View style={[styles.videoSection, isLandscape && styles.videoSectionLandscape]}>
        {!videoStarted ? (
          <TouchableOpacity
            style={styles.posterContainer}
            onPress={() => setVideoStarted(true)}
            activeOpacity={0.9}
          >
            {lesson.thumbnail_url ? (
              <Image
                source={{ uri: lesson.thumbnail_url }}
                style={styles.poster}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.posterPlaceholder} />
            )}
            <View style={styles.posterOverlay} />
            <View style={styles.posterPlayBtn}>
              <Ionicons
                name="play"
                size={48}
                color="rgba(255,255,255,0.95)"
              />
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.videoContainer}>
            <Video
              ref={videoRef}
              source={videoSource}
              style={styles.video}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay
              onPlaybackStatusUpdate={handlePlaybackStatus}
              useNativeControls
            />
          </View>
        )}
      </View>

      {/* Right panel — portrait uses full-width flow below video */}
      <View style={[styles.rightPanel, isLandscape && styles.rightPanelLandscape]}>
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
            minimumTrackTintColor={'#7C3AED'}
            maximumTrackTintColor="rgba(255,255,255,0.2)"
            thumbTintColor={'#FFFFFF'}
          />
          <Text style={styles.speedEmoji}>🐇</Text>
          <Text style={styles.speedLabel}>
            {playbackSpeed.toFixed(2)}x
          </Text>
        </View>

        {activeNotes.length > 0 ? (
          <View style={styles.notationPanelWrap}>
            <ScrollingNotation
              notes={activeNotes}
              activeNoteIndex={activeNoteIndex}
              noteProgress={noteProgress}
              isTutor={isTutor}
              onNotesEdit={handleNotesEdit}
              isLandscape={isLandscape}
            />
          </View>
        ) : (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color={'rgba(255,255,255,0.75)'} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
  },
  containerLandscape: {
    flexDirection: 'row',
  },
  videoSection: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  videoSectionLandscape: {
    flex: 1,
    width: undefined,
    aspectRatio: undefined,
    alignSelf: 'stretch',
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  rightPanel: {
    flex: 1,
    flexDirection: 'column',
  },
  rightPanelLandscape: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  lessonTitleLandscape: {
    fontFamily: Typography.regular,
    fontSize: FontSize.sm,
    color: '#FFFFFF',
    opacity: 0.75,
    paddingVertical: Spacing.sm,
  },
  posterContainer: {
    width: '100%',
    height: '100%',
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  poster: {
    ...StyleSheet.absoluteFillObject,
  },
  posterPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  posterOverlay: {
    ...StyleSheet.absoluteFillObject,
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
  videoContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#000',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
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
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xxl,
  },
  navBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playPauseBtn: {
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
    backgroundColor: '#FFFFFF',
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
    color: '#FFFFFF',
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
