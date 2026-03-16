/**
 * HarmoniumPlayer — video-driven notation. Video is source of truth;
 * notation syncs to video position every 100ms. Engine syncToTime() replaces ticker.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Audio } from 'expo-av';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Colors, FontSize, Radius, Spacing, Typography } from '@/src/constants/theme';
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

const SPEEDS: Array<0.5 | 1.0 | 1.5> = [0.5, 1.0, 1.5];
const SPEED_LABELS: Record<number, string> = {
  0.5: '0.5x',
  1.0: '1.0x',
  1.5: '1.5x',
};

export function HarmoniumPlayer({ lesson, notes = [], onComplete, onProgress }: LessonPlayerProps) {
  const engineRef = useRef<SargamPlayerEngine | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const [activeNoteIndex, setActiveNoteIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<0.5 | 1.0 | 1.5>(1.0);
  const progressAnim = useRef(new Animated.Value(0)).current;
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
      engineRef.current?.syncToTime(position);
      const duration = player.duration ?? 1;
      const ratio = duration > 0 ? position / duration : 0;
      progressAnim.setValue(ratio);
    }, 100);
    return () => clearInterval(interval);
  }, [player, progressAnim]);

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

  return (
    <View style={styles.container}>
      <VideoView
        player={player}
        style={styles.video}
        allowsFullscreen
        allowsPictureInPicture
        nativeControls
      />

      <View style={styles.speedRow}>
        {SPEEDS.map((speed) => (
          <TouchableOpacity
            key={speed}
            onPress={() => setPlaybackSpeed(speed)}
            style={[
              styles.speedBtn,
              playbackSpeed === speed && styles.speedBtnActive,
            ]}
          >
            <Text
              style={[
                styles.speedText,
                playbackSpeed === speed && styles.speedTextActive,
              ]}
            >
              {SPEED_LABELS[speed]}
            </Text>
          </TouchableOpacity>
        ))}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  video: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
  },
  speedRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  speedBtn: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  speedBtnActive: {
    backgroundColor: Colors.bgPrimary,
    borderColor: Colors.textPrimary,
  },
  speedText: {
    fontFamily: Typography.semiBold,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  speedTextActive: {
    color: Colors.textPrimary,
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
