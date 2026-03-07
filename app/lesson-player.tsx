import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { lessonPlayerStyles } from '../src/styles/lessonPlayerStyles';
import { getLevelById } from '../src/types/levelTypes';
import { getInstrumentNotation } from '../src/utils/instrumentUtils';

const sargamData = [
  { id: 1, beats: ['Sa', 'Re', 'Ga', 'Ma'] },
  { id: 2, beats: ['Pa', 'Dha', 'Ni', 'Sa'] },
  { id: 3, beats: ['Sa', 'Sa', 'Re', 'Re'] },
  { id: 4, beats: ['Ga', 'Ga', 'Ma', 'Ma'] },
  { id: 5, beats: ['Pa', 'Pa', 'Dha', 'Dha'] },
  { id: 6, beats: ['Ni', 'Ni', 'Sa', 'Sa'] },
];

const bolsData = [
  { id: 1, beats: ['Dha', 'Tin', 'Na', 'Na'] },
  { id: 2, beats: ['Dha', 'Dha', 'Tin', 'Tin'] },
  { id: 3, beats: ['Na', 'Na', 'Dha', 'Dha'] },
];

const jianpuData = [
  { id: 1, beats: [1, 2, 3, 4] },
  { id: 2, beats: [5, 6, 7, 1] },
  { id: 3, beats: [1, 1, 2, 2] },
];

const tabData = [
  { string: 'e', frets: [0, 2, 3, 0, 2, 0] },
  { string: 'B', frets: [1, 0, 0, 1, 0, 1] },
  { string: 'G', frets: [0, 0, 0, 0, 0, 0] },
  { string: 'D', frets: [2, 0, 0, 2, 3, 2] },
  { string: 'A', frets: [3, 2, 0, 0, 0, 0] },
  { string: 'E', frets: [0, 0, 0, 0, 0, 0] },
];

const staffNotes = [
  { id: 1, position: 1, name: 'E' },
  { id: 2, position: 3, name: 'G' },
  { id: 3, position: 5, name: 'B' },
  { id: 4, position: 7, name: 'D' },
  { id: 5, position: 9, name: 'F' },
  { id: 6, position: 7, name: 'D' },
  { id: 7, position: 5, name: 'B' },
  { id: 8, position: 3, name: 'G' },
  { id: 9, position: 5, name: 'B' },
  { id: 10, position: 7, name: 'D' },
  { id: 11, position: 9, name: 'F' },
  { id: 12, position: 5, name: 'B' },
];

type NotationType = 'Staff' | 'Sargam' | 'Tablature (Tabs)' | 'Jianpu' | 'Bols' | 'Staff with Lyrics' | 'Percussion Staff';

function getNotationType(primaryNotation: string): NotationType {
  const type = primaryNotation as NotationType;
  const valid: NotationType[] = ['Staff', 'Sargam', 'Tablature (Tabs)', 'Jianpu', 'Bols', 'Staff with Lyrics', 'Percussion Staff'];
  return valid.includes(type) ? type : 'Staff';
}

export default function LessonPlayerScreen() {
  const router = useRouter();
  const isFocused = useIsFocused();
  const [bpm, setBpm] = useState(80);
  const [currentInstrument, setCurrentInstrument] = useState<string>('Harmonium');
  const [currentLevelId, setCurrentLevelId] = useState<string>('beginner');
  const [currentNoteIndex] = useState(0);

  const instrumentData = getInstrumentNotation(currentInstrument);
  const levelData = getLevelById(currentLevelId);
  const notationType = instrumentData ? getNotationType(instrumentData.primary_notation) : 'Staff';

  useEffect(() => {
    if (!isFocused) return;
    (async () => {
      try {
        const savedInstrument = await AsyncStorage.getItem('selectedInstrument');
        const savedLevel = await AsyncStorage.getItem('selectedLevel');
        if (savedInstrument) setCurrentInstrument(savedInstrument);
        if (savedLevel) setCurrentLevelId(savedLevel);
      } catch (error) {
        console.error('Error loading selections:', error);
      }
    })();
  }, [isFocused]);

  const increaseBpm = () => setBpm((prev) => Math.min(prev + 5, 200));
  const decreaseBpm = () => setBpm((prev) => Math.max(prev - 5, 40));

  const renderSargam = () => (
    <View style={lessonPlayerStyles.sargamContainer}>
      {sargamData.map((measure) => (
        <View key={measure.id} style={lessonPlayerStyles.measureRow}>
          <Text style={lessonPlayerStyles.measureBar}>|</Text>
          <View style={lessonPlayerStyles.beatsContainer}>
            {measure.beats.map((note, index) => (
              <View
                key={`${measure.id}-${index}`}
                style={[lessonPlayerStyles.beat, index === 0 ? lessonPlayerStyles.beatActive : lessonPlayerStyles.beatInactive]}
              >
                <Text
                  style={[
                    lessonPlayerStyles.beatText,
                    index === 0 ? lessonPlayerStyles.beatTextActive : lessonPlayerStyles.beatTextInactive,
                  ]}
                >
                  {note}
                </Text>
              </View>
            ))}
          </View>
          <Text style={lessonPlayerStyles.measureBar}>|</Text>
        </View>
      ))}
    </View>
  );

  const renderBols = () => (
    <View style={lessonPlayerStyles.sargamContainer}>
      {bolsData.map((measure) => (
        <View key={measure.id} style={lessonPlayerStyles.measureRow}>
          <Text style={lessonPlayerStyles.measureBar}>|</Text>
          <View style={lessonPlayerStyles.beatsContainer}>
            {measure.beats.map((note, index) => (
              <View
                key={`${measure.id}-${index}`}
                style={[lessonPlayerStyles.beat, index === 0 ? lessonPlayerStyles.beatActive : lessonPlayerStyles.beatInactive]}
              >
                <Text
                  style={[
                    lessonPlayerStyles.beatText,
                    index === 0 ? lessonPlayerStyles.beatTextActive : lessonPlayerStyles.beatTextInactive,
                  ]}
                >
                  {note}
                </Text>
              </View>
            ))}
          </View>
          <Text style={lessonPlayerStyles.measureBar}>|</Text>
        </View>
      ))}
    </View>
  );

  const renderJianpu = () => (
    <View style={lessonPlayerStyles.jianpuContainer}>
      {jianpuData.flatMap((measure) =>
        measure.beats.map((num, index) => (
          <View
            key={`${measure.id}-${index}`}
            style={[
              lessonPlayerStyles.jianpuBeat,
              index === 0 ? lessonPlayerStyles.jianpuBeatActive : lessonPlayerStyles.jianpuBeatInactive,
            ]}
          >
            <Text
              style={[
                lessonPlayerStyles.jianpuText,
                index === 0 ? lessonPlayerStyles.beatTextActive : lessonPlayerStyles.beatTextInactive,
              ]}
            >
              {num}
            </Text>
          </View>
        ))
      )}
    </View>
  );

  const renderTablature = () => (
    <View style={lessonPlayerStyles.tabContainer}>
      {tabData.map((line, lineIndex) => (
        <View key={line.string} style={lessonPlayerStyles.tabLine}>
          <Text style={lessonPlayerStyles.tabStringLabel}>{line.string}|</Text>
          {line.frets.map((fret, i) => (
            <Text
              key={`${line.string}-${i}`}
              style={[lessonPlayerStyles.tabFret, i === 0 ? lessonPlayerStyles.tabFretActive : undefined]}
            >
              {fret}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );

  const renderStaff = (withLyrics = false) => (
    <View style={lessonPlayerStyles.staffContainer}>
      <View style={lessonPlayerStyles.staff}>
        {[1, 2, 3, 4, 5].map((line) => (
          <View key={line} style={lessonPlayerStyles.staffLine} />
        ))}
        <Text style={lessonPlayerStyles.trebleClef}>𝄞</Text>
        <View style={lessonPlayerStyles.notesContainer}>
          {staffNotes.slice(0, 8).map((note, index) => {
            const isActive = index === currentNoteIndex;
            const bottomPercent = ((note.position - 1) / 8) * 100;
            return (
              <View
                key={note.id}
                style={[
                  lessonPlayerStyles.note,
                  { position: 'absolute' as const, left: `${10 + index * 10}%`, bottom: `${bottomPercent - 8}%` },
                ]}
              >
                <View
                  style={[
                    lessonPlayerStyles.noteHead,
                    isActive ? lessonPlayerStyles.noteHeadActive : lessonPlayerStyles.noteHeadInactive,
                  ]}
                />
                <View
                  style={[
                    lessonPlayerStyles.noteStem,
                    isActive ? lessonPlayerStyles.noteStemActive : lessonPlayerStyles.noteStemInactive,
                  ]}
                />
              </View>
            );
          })}
        </View>
      </View>
      {withLyrics && (
        <View style={lessonPlayerStyles.lyricsLine}>
          <Text style={lessonPlayerStyles.lyricsText}>Sa re ga ma pa dha ni sa</Text>
        </View>
      )}
    </View>
  );

  const renderPercussionStaff = () => (
    <View style={lessonPlayerStyles.tabContainer}>
      {['Snare', 'Kick', 'Hi-Hat'].map((label, rowIndex) => (
        <View key={label} style={lessonPlayerStyles.percussionRow}>
          <Text style={lessonPlayerStyles.percussionLabel}>{label}</Text>
          <View style={lessonPlayerStyles.percussionLine} />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <View
              key={i}
              style={[
                lessonPlayerStyles.percussionNote,
                i === 0 ? lessonPlayerStyles.percussionNoteActive : undefined,
              ]}
            />
          ))}
        </View>
      ))}
    </View>
  );

  const renderNotation = () => {
    switch (notationType) {
      case 'Sargam':
        return renderSargam();
      case 'Bols':
        return renderBols();
      case 'Jianpu':
        return renderJianpu();
      case 'Tablature (Tabs)':
        return renderTablature();
      case 'Staff with Lyrics':
        return renderStaff(true);
      case 'Percussion Staff':
        return renderPercussionStaff();
      case 'Staff':
      default:
        return renderStaff(false);
    }
  };

  return (
    <View style={lessonPlayerStyles.container}>
      <ScrollView style={lessonPlayerStyles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={lessonPlayerStyles.content}>
          <Pressable
            style={({ pressed }) => [lessonPlayerStyles.backButton, { opacity: pressed ? 0.8 : 1 }]}
            onPress={() => router.back()}
          >
            <Text style={lessonPlayerStyles.backIcon}>‹</Text>
            <Text style={lessonPlayerStyles.backText}>Back</Text>
          </Pressable>

          <View style={lessonPlayerStyles.header}>
            <Text style={lessonPlayerStyles.subtitle}>
              {instrumentData && levelData
                ? `${instrumentData.instrument} • ${levelData.name}`
                : 'Instrument • Loading'}
            </Text>
            <Text style={lessonPlayerStyles.title}>Raag Basics – Lesson 1</Text>
          </View>

          {instrumentData && (
            <View style={lessonPlayerStyles.notationInfo}>
              <Text style={lessonPlayerStyles.notationTitle}>Notation System</Text>
              <Text style={lessonPlayerStyles.notationType}>{instrumentData.primary_notation}</Text>
              <Text style={lessonPlayerStyles.notationDetails}>{instrumentData.details}</Text>
            </View>
          )}

          <View style={lessonPlayerStyles.videoContainer}>
            <View style={lessonPlayerStyles.videoContent}>
              <Pressable style={({ pressed }) => [lessonPlayerStyles.playButton, { opacity: pressed ? 0.8 : 1 }]}>
                <Text style={lessonPlayerStyles.playIcon}>▶</Text>
              </Pressable>
              <View style={lessonPlayerStyles.videoInfo}>
                <Text style={lessonPlayerStyles.videoTitle}>Raag Basics - Introduction</Text>
                <Text style={lessonPlayerStyles.videoDuration}>12:45</Text>
              </View>
            </View>
          </View>

          <View style={lessonPlayerStyles.tempoControl}>
            <Pressable
              style={({ pressed }) => [lessonPlayerStyles.tempoButton, { opacity: pressed ? 0.8 : 1 }]}
              onPress={decreaseBpm}
            >
              <Text style={lessonPlayerStyles.tempoIcon}>−</Text>
            </Pressable>
            <Text style={lessonPlayerStyles.tempoText}>{bpm} BPM</Text>
            <Pressable
              style={({ pressed }) => [lessonPlayerStyles.tempoButton, { opacity: pressed ? 0.8 : 1 }]}
              onPress={increaseBpm}
            >
              <Text style={lessonPlayerStyles.tempoIcon}>+</Text>
            </Pressable>
          </View>

          <View style={lessonPlayerStyles.notationSection}>{renderNotation()}</View>
        </View>
      </ScrollView>

      <View style={lessonPlayerStyles.floatingButtonContainer}>
        <Pressable style={({ pressed }) => [lessonPlayerStyles.floatingButton, { opacity: pressed ? 0.8 : 1 }]}>
          <Text style={lessonPlayerStyles.floatingButtonText}>Start Guided Practice</Text>
        </Pressable>
      </View>
    </View>
  );
}
