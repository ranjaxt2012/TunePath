/**
 * HarmoniumPlayer — BPM-driven sargam notation playback.
 * Play button starts ticker → plays audio samples → drives ScrollingNotation.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Audio } from 'expo-av';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { Colors, FontSize, Radius, Spacing, Typography, Shadows } from '@/src/constants/theme';
import { ScrollingNotation } from './ScrollingNotation';
import type { LessonPlayerProps } from '@/src/registry/types';
import type { Note } from '@/src/utils/notation';

// Asset IDs from Metro — each sargam note maps to a sample
const SAMPLE_MAP: Record<string, number> = {
  Sa: require('../../assets/instruments/harmonium/samples/Sa.mp3') as number,
  Re: require('../../assets/instruments/harmonium/samples/Re.mp3') as number,
  Ga: require('../../assets/instruments/harmonium/samples/Ga.mp3') as number,
  Ma: require('../../assets/instruments/harmonium/samples/Ma.mp3') as number,
  Pa: require('../../assets/instruments/harmonium/samples/Pa.mp3') as number,
  Dha: require('../../assets/instruments/harmonium/samples/Dha.mp3') as number,
  Ni: require('../../assets/instruments/harmonium/samples/Ni.mp3') as number,
};

function getExpoAudio(): typeof import('expo-av').Audio | null {
  if (Platform.OS === 'web') return null;
  // Expo Go lacks ExponentAV native module — only load in Standalone/build
  if (Constants.executionEnvironment !== ExecutionEnvironment.Standalone) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-av').Audio;
  } catch {
    return null;
  }
}

export function HarmoniumPlayer({ lesson, notes = [], onComplete, onProgress }: LessonPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeNoteIndex, setActiveNoteIndex] = useState(-1);
  const [bpm, setBpm] = useState(80);

  const tickerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const soundRef = useRef<{ unloadAsync: () => Promise<unknown>; stopAsync: () => Promise<unknown> } | null>(null);
  const activeIndexRef = useRef(-1);
  const bpmRef = useRef(80);
  const notesRef = useRef<Note[]>([]);

  const displayNotes = notes.length > 0 ? notes : getMockNotes();
  notesRef.current = displayNotes;

  const testAudio = async () => {
    console.log('🧪 Test button tapped');
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
      });
      console.log('🔊 Audio mode set');
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/instruments/harmonium/samples/Sa.mp3'),
        { shouldPlay: true, volume: 1.0 }
      );
      console.log('✅ Sa.mp3 loaded and playing');
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          console.log('📊 Playback status:', status.isPlaying, status.positionMillis);
        }
      });
    } catch (e) {
      console.error('❌ Test audio failed:', e);
    }
  };

  useEffect(() => {
    activeIndexRef.current = activeNoteIndex;
  }, [activeNoteIndex]);

  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  useEffect(() => {
    const AudioModule = getExpoAudio();
    if (AudioModule) {
      void AudioModule.setAudioModeAsync({
        playsInSilentModeIOS: true,
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
      });
      console.log('🔊 Audio mode set successfully');
    }
  }, []);

  const playNote = useCallback(async (noteName: string): Promise<void> => {
    console.log('🎵 playNote called:', noteName);
    const AudioModule = getExpoAudio();
    if (!AudioModule) return;

    const normalized = noteName.charAt(0).toUpperCase() + noteName.slice(1).toLowerCase();
    const source = SAMPLE_MAP[normalized];
    if (source === undefined) return;

    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      const { sound } = await AudioModule.Sound.createAsync(source, {
        shouldPlay: true,
        volume: 1.0,
      });
      console.log('✅ Sound created for:', noteName);
      soundRef.current = sound;
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          void sound.unloadAsync();
        }
      });
    } catch (e) {
      console.error('❌ Audio error for:', noteName, e);
    }
  }, []);

  const stopPlayback = useCallback(() => {
    if (tickerRef.current) {
      clearTimeout(tickerRef.current);
      tickerRef.current = null;
    }
    if (soundRef.current) {
      void soundRef.current.stopAsync();
      void soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    setIsPlaying(false);
    setActiveNoteIndex(-1);
    activeIndexRef.current = -1;
  }, []);

  const advanceTicker = useCallback(() => {
    const currentNotes = notesRef.current;
    const nextIndex = activeIndexRef.current + 1;

    if (nextIndex >= currentNotes.length) {
      stopPlayback();
      return;
    }

    activeIndexRef.current = nextIndex;
    setActiveNoteIndex(nextIndex);

    console.log('⏱ Ticker fired, index:', nextIndex, 'note:', currentNotes[nextIndex].note);
    void playNote(currentNotes[nextIndex].note);

    const msPerBeat = (60 / bpmRef.current) * 1000;
    tickerRef.current = setTimeout(() => {
      advanceTicker();
    }, msPerBeat);
  }, [playNote, stopPlayback]);

  const startPlayback = useCallback(() => {
    activeIndexRef.current = -1;
    setActiveNoteIndex(-1);
    setIsPlaying(true);
    advanceTicker();
  }, [advanceTicker]);

  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, [stopPlayback]);

  return (
    <View style={styles.container}>
      <Text style={styles.lessonTitle} numberOfLines={1} ellipsizeMode="tail">
        {lesson.title}
      </Text>

      <View style={styles.bpmRow}>
        <Text style={styles.bpmEmoji}>🐢</Text>
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
        <Text style={styles.bpmEmoji}>🐇</Text>
        <Text style={styles.bpmLabel}>{Math.round(bpm)} BPM</Text>
      </View>

      <TouchableOpacity onPress={testAudio} style={styles.testAudioBtn}>
        <Text style={styles.testAudioText}>🔊 Test Audio</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={isPlaying ? stopPlayback : startPlayback}
        style={styles.playButton}
      >
        <Ionicons
          name={isPlaying ? 'pause' : 'play'}
          size={32}
          color={Colors.textPrimary}
        />
      </TouchableOpacity>

      {displayNotes.length > 0 ? (
        <ScrollingNotation
          notes={displayNotes}
          activeNoteIndex={activeNoteIndex}
        />
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
  lessonTitle: {
    fontSize: FontSize.sm,
    fontFamily: Typography.regular,
    color: Colors.textPrimary,
    opacity: 0.75,
    marginBottom: Spacing.sm,
  },
  bpmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  slider: {
    flex: 1,
    marginHorizontal: Spacing.sm,
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
  testAudioBtn: {
    alignSelf: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: Radius.md,
  },
  testAudioText: {
    fontFamily: Typography.medium,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: Spacing.xl,
    ...Shadows.md,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
});
