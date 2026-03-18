/**
 * HarmoniumPlayer — video-driven notation. Video is source of truth;
 * notation syncs to video position every 100ms. Engine syncToTime() replaces ticker.
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  Animated,
  TouchableOpacity,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { setAudioModeAsync } from 'expo-audio';
import * as Sharing from 'expo-sharing';
import { useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Colors, FontSize, Spacing, Typography } from '@/src/constants/theme';
import { formatTime } from '@/src/utils/time';
import { logger } from '@/src/utils/logger';
import { ScrollingNotation } from './ScrollingNotation';
import { SargamPlayerEngine } from './SargamPlayerEngine';
import { HARMONIUM_SAMPLE_MAP } from './sampleMap';
import type { LessonPlayerProps } from '@/src/registry/types';
import type { Note } from '@/src/utils/notation';

const MOCK_VIDEO_URL =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

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
  onProgress,
  lessonIds,
  currentLessonIndex,
}: LessonPlayerProps) {
  const router = useRouter();
  const isTutor = true; // TODO: derive from useAuthStore when testing done
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const engineRef = useRef<SargamPlayerEngine | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const [activeNoteIndex, setActiveNoteIndex] = useState(-1);
  const [noteProgress, setNoteProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [videoStarted, setVideoStarted] = useState(false);
  const [videoMounted, setVideoMounted] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [localNotes, setLocalNotes] = useState<Note[]>([]);
  const [showDebug, setShowDebug] = useState(false);
  const [debugLines, setDebugLines] = useState<string[]>([]);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const controlsOpacity = useRef(new Animated.Value(0)).current;
  const hideControlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const displayNotesRef = useRef<Note[]>([]);
  const hasInitiallyPaused = useRef(false);

  const hasPrev = (currentLessonIndex ?? 0) > 0;
  const hasNext = lessonIds
    ? (currentLessonIndex ?? 0) < lessonIds.length - 1
    : false;

  const goToPrev = useCallback(() => {
    if (!hasPrev || !lessonIds) return;
    const prevId = lessonIds[(currentLessonIndex ?? 0) - 1];
    router.replace(`/lesson/${prevId}`);
  }, [hasPrev, lessonIds, currentLessonIndex, router]);

  const goToNext = useCallback(() => {
    if (!hasNext || !lessonIds) return;
    const nextId = lessonIds[(currentLessonIndex ?? 0) + 1];
    router.replace(`/lesson/${nextId}`);
  }, [hasNext, lessonIds, currentLessonIndex, router]);

  const videoSource = lesson.video_url ?? MOCK_VIDEO_URL;
  const player = useVideoPlayer(videoStarted ? videoSource : null, (p) => {
    p.loop = false;
    p.playbackRate = playbackSpeed;
    p.timeUpdateEventInterval = 0.1;
  });

  useEffect(() => {
    if (!videoStarted) return;
    const sub = player.addListener('statusChange', ({ status }) => {
      logger.log('PLAYER', 'statusChange', { status });
      if (status === 'readyToPlay' && !hasInitiallyPaused.current) {
        hasInitiallyPaused.current = true;
        player.pause();
        sub.remove();
      }
    });
    return () => sub.remove();
  }, [videoStarted, player]);

  useEffect(() => {
    hasInitiallyPaused.current = false;
  }, [videoStarted]);

  useEffect(() => {
    if (!videoStarted) return;
    const t = setTimeout(() => setVideoMounted(true), 100);
    return () => clearTimeout(t);
  }, [videoStarted]);

  const mockNotes = useMemo(() => getMockNotes(), []);
  const displayNotes = useMemo(
    () => (notes.length > 0 ? notes : mockNotes),
    [notes, mockNotes]
  );
  const activeNotes = useMemo(
    () => (localNotes.length > 0 ? localNotes : displayNotes),
    [localNotes, displayNotes]
  );
  displayNotesRef.current = activeNotes;

  const progressValue = useMemo(
    () =>
      activeNoteIndex < 0
        ? 0
        : activeNoteIndex / Math.max(1, activeNotes.length - 1),
    [activeNoteIndex, activeNotes.length]
  );

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

  useEffect(() => {
    player.playbackRate = playbackSpeed;
  }, [playbackSpeed, player]);

  useEffect(() => {
    if (!videoStarted) return;
    const sub = player.addListener('timeUpdate', ({ currentTime }) => {
      const t0 = Date.now();
      engineRef.current?.syncToTime(currentTime, playbackSpeed);
      logger.perf('syncToTime', Date.now() - t0);
      logger.log('PLAYER', 'timeUpdate', {
        currentTime: currentTime.toFixed(2),
        progressValue,
      });
      const duration = player.duration ?? 1;
      progressAnim.setValue(duration > 0 ? currentTime / duration : 0);
    });
    return () => sub.remove();
  }, [videoStarted, player, progressAnim, playbackSpeed, progressValue]);

  useEffect(() => {
    const sub = player.addListener('playingChange', ({ isPlaying: playing }) => {
      setIsPlaying(playing);
      logger.log('PLAYER', 'playingChange', { playing });
    });
    return () => sub.remove();
  }, [player]);

  useEffect(() => {
    const sub = player.addListener('playToEnd', () => {
      setActiveNoteIndex(-1);
      progressAnim.setValue(0);
      engineRef.current?.onComplete?.();
      player.currentTime = 0;
      player.pause();
      setIsPlaying(false);
    });
    return () => sub.remove();
  }, [player, progressAnim]);

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
    if (!__DEV__) return;
    const interval = setInterval(() => {
      const entries = logger
        .getBuffer()
        .slice(-8)
        .map((e) => {
          const t = (e.ts / 1000).toFixed(1);
          return `[${t}s] ${e.message}`;
        });
      setDebugLines(entries);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const exportLogs = useCallback(async () => {
    try {
      const path = await logger.exportToFile();
      await Sharing.shareAsync(path);
    } catch {
      // ignore export errors in dev
    }
  }, []);

  useEffect(() => {
    return () => {
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    };
  }, []);

  return (
    <View style={[styles.container, isLandscape && styles.containerLandscape]}>
      {__DEV__ && (
        <TouchableOpacity
          onPress={() => setShowDebug((d) => !d)}
          style={styles.debugToggle}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.debugToggleText}>🐛</Text>
        </TouchableOpacity>
      )}

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
            {videoMounted && (
              <VideoView
                player={player}
                style={styles.video}
                allowsFullscreen
                allowsPictureInPicture
                nativeControls={false}
              />
            )}
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              onPress={handleVideoTap}
              activeOpacity={1}
            />
            {showControls && (
              <Animated.View
                style={[styles.controlsOverlay, { opacity: controlsOpacity }]}
                pointerEvents="box-none"
              >
                <View style={styles.controlsGradient} />
                <View style={styles.controlsRow}>
                  <TouchableOpacity
                    onPress={goToPrev}
                    disabled={!hasPrev}
                    style={styles.navBtn}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  >
                    <Ionicons
                      name="play-skip-back"
                      size={28}
                      color={hasPrev ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.3)'}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleVideoTap} style={styles.playPauseBtn}>
                    <Ionicons
                      name={isPlaying ? 'pause' : 'play'}
                      size={48}
                      color="rgba(255,255,255,0.95)"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={goToNext}
                    disabled={!hasNext}
                    style={styles.navBtn}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  >
                    <Ionicons
                      name="play-skip-forward"
                      size={28}
                      color={hasNext ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.3)'}
                    />
                  </TouchableOpacity>
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
        )}
      </View>

      {/* Right panel — portrait uses full-width flow below video */}
      <View style={[styles.rightPanel, isLandscape && styles.rightPanelLandscape]}>
        {isLandscape && (
          <Text style={styles.lessonTitleLandscape} numberOfLines={1}>
            {lesson.title}
          </Text>
        )}

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
            <ActivityIndicator size="small" color={Colors.textSecondary} />
          </View>
        )}
      </View>

      {__DEV__ && showDebug && (
        <View style={styles.debugPanel}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {debugLines.map((line, i) => (
              <Text key={i} style={styles.debugLine}>
                {line}
              </Text>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.exportBtn} onPress={exportLogs}>
            <Text style={styles.exportBtnText}>📤 Export Logs</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() => {
              logger.clear();
              setDebugLines([]);
            }}
          >
            <Text style={styles.exportBtnText}>🗑 Clear</Text>
          </TouchableOpacity>
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
  containerLandscape: {
    flexDirection: 'row',
  },
  videoSection: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  videoSectionLandscape: {
    flex: 1,
    width: undefined,
    aspectRatio: undefined,
    height: '100%',
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
    color: Colors.textPrimary,
    opacity: 0.75,
    paddingVertical: Spacing.sm,
  },
  posterContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  poster: {
    ...StyleSheet.absoluteFillObject,
  },
  posterPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.cardBg,
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
  debugToggle: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    zIndex: 999,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  debugToggleText: {
    fontSize: 18,
  },
  debugPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: 'rgba(0,0,0,0.9)',
    padding: Spacing.sm,
    zIndex: 998,
  },
  debugLine: {
    color: '#00FF00',
    fontSize: 10,
    fontFamily: 'monospace',
  },
  exportBtn: {
    backgroundColor: Colors.bgPrimary,
    padding: Spacing.sm,
    borderRadius: 8,
    marginTop: Spacing.xs,
    alignItems: 'center',
  },
  clearBtn: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    padding: Spacing.sm,
    borderRadius: 8,
    marginTop: Spacing.xs,
    alignItems: 'center',
  },
  exportBtnText: {
    color: Colors.textPrimary,
    fontSize: FontSize.xs,
    fontFamily: Typography.medium,
  },
});
