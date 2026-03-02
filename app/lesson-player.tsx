import { Pressable, Text, View, ScrollView, StyleSheet } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { lessonPlayerStyles } from '../src/styles/lessonPlayerStyles';

const notationData = [
  { id: 1, beats: ['Sa', 'Re', 'Ga', 'Ma'] },
  { id: 2, beats: ['Pa', 'Dha', 'Ni', 'Sa'] },
  { id: 3, beats: ['Sa', 'Sa', 'Re', 'Re'] },
  { id: 4, beats: ['Ga', 'Ga', 'Ma', 'Ma'] },
  { id: 5, beats: ['Pa', 'Pa', 'Dha', 'Dha'] },
  { id: 6, beats: ['Ni', 'Ni', 'Sa', 'Sa'] },
];

export default function LessonPlayerScreen() {
  const router = useRouter();
  const [bpm, setBpm] = useState(80);
  const [notationMode, setNotationMode] = useState<'sargam' | 'staff'>('staff');
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);

  const increaseBpm = () => setBpm(prev => Math.min(prev + 5, 200));
  const decreaseBpm = () => setBpm(prev => Math.max(prev - 5, 40));

  // Staff notation notes with positions (line number from bottom: 1-9, odd = on line, even = between lines)
  const staffNotes = [
    { id: 1, position: 1, name: 'E' }, // Bottom line
    { id: 2, position: 3, name: 'G' },
    { id: 3, position: 5, name: 'B' }, // Middle line
    { id: 4, position: 7, name: 'D' },
    { id: 5, position: 9, name: 'F' }, // Top line
    { id: 6, position: 7, name: 'D' },
    { id: 7, position: 5, name: 'B' },
    { id: 8, position: 3, name: 'G' },
    { id: 9, position: 5, name: 'B' },
    { id: 10, position: 7, name: 'D' },
    { id: 11, position: 9, name: 'F' },
    { id: 12, position: 5, name: 'B' },
  ];

  return (
    <View style={lessonPlayerStyles.container}>
      <ScrollView style={lessonPlayerStyles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={lessonPlayerStyles.content}>
          {/* Back Button */}
          <Pressable 
            style={({ pressed }) => [lessonPlayerStyles.backButton, { opacity: pressed ? 0.8 : 1 }]}
            onPress={() => router.back()}
          >
            <Text style={lessonPlayerStyles.backIcon}>‹</Text>
            <Text style={lessonPlayerStyles.backText}>Back</Text>
          </Pressable>

          {/* Header */}
          <View style={lessonPlayerStyles.header}>
            <Text style={lessonPlayerStyles.subtitle}>Harmonium • Beginner</Text>
            <Text style={lessonPlayerStyles.title}>Raag Basics – Lesson 1</Text>
          </View>

          {/* Video Container */}
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

          {/* Tempo Control */}
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

          {/* Segmented Control */}
          <View style={lessonPlayerStyles.segmentedControl}>
            <Pressable
              style={[
                lessonPlayerStyles.segmentButton,
                notationMode === 'sargam' ? lessonPlayerStyles.segmentButtonActive : lessonPlayerStyles.segmentButtonInactive
              ]}
              onPress={() => setNotationMode('sargam')}
            >
              <Text style={[
                lessonPlayerStyles.segmentButtonText,
                notationMode === 'sargam' ? lessonPlayerStyles.segmentButtonTextActive : lessonPlayerStyles.segmentButtonTextInactive
              ]}>
                Sargam
              </Text>
            </Pressable>
            <Pressable
              style={[
                lessonPlayerStyles.segmentButton,
                notationMode === 'staff' ? lessonPlayerStyles.segmentButtonActive : lessonPlayerStyles.segmentButtonInactive
              ]}
              onPress={() => setNotationMode('staff')}
            >
              <Text style={[
                lessonPlayerStyles.segmentButtonText,
                notationMode === 'staff' ? lessonPlayerStyles.segmentButtonTextActive : lessonPlayerStyles.segmentButtonTextInactive
              ]}>
                Staff
              </Text>
            </Pressable>
          </View>

          {/* Notation Section */}
          <View style={lessonPlayerStyles.notationSection}>
            {notationMode === 'sargam' ? (
              <View style={lessonPlayerStyles.sargamContainer}>
                {notationData.map((measure) => (
                  <View key={measure.id} style={lessonPlayerStyles.measureRow}>
                    <Text style={lessonPlayerStyles.measureBar}>|</Text>
                    <View style={lessonPlayerStyles.beatsContainer}>
                      {measure.beats.map((note, index) => (
                        <View
                          key={`${measure.id}-${index}`}
                          style={[
                            lessonPlayerStyles.beat,
                            index === 0 ? lessonPlayerStyles.beatActive : lessonPlayerStyles.beatInactive
                          ]}
                        >
                          <Text style={[
                            lessonPlayerStyles.beatText,
                            index === 0 ? lessonPlayerStyles.beatTextActive : lessonPlayerStyles.beatTextInactive
                          ]}>
                            {note}
                          </Text>
                        </View>
                      ))}
                    </View>
                    <Text style={lessonPlayerStyles.measureBar}>|</Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={lessonPlayerStyles.staffContainer}>
                {/* First Staff */}
                <View style={lessonPlayerStyles.staff}>
                  {/* Staff Lines */}
                  {[1, 2, 3, 4, 5].map((line) => (
                    <View key={line} style={lessonPlayerStyles.staffLine} />
                  ))}
                  
                  {/* Treble Clef */}
                  <Text style={lessonPlayerStyles.trebleClef}>𝄞</Text>
                  
                  {/* Notes */}
                  <View style={lessonPlayerStyles.notesContainer}>
                    {staffNotes.slice(0, 8).map((note, index) => {
                      const isActive = index === currentNoteIndex;
                      const bottomPercent = ((note.position - 1) / 8) * 100;
                      
                      return (
                        <View
                          key={note.id}
                          style={[
                            lessonPlayerStyles.note,
                            {
                              position: 'absolute',
                              left: `${10 + (index * 10)}%`,
                              bottom: `${bottomPercent - 8}%`
                            }
                          ]}
                        >
                          <View style={[
                            lessonPlayerStyles.noteHead,
                            isActive ? lessonPlayerStyles.noteHeadActive : lessonPlayerStyles.noteHeadInactive
                          ]} />
                          <View style={[
                            lessonPlayerStyles.noteStem,
                            isActive ? lessonPlayerStyles.noteStemActive : lessonPlayerStyles.noteStemInactive
                          ]} />
                        </View>
                      );
                    })}
                  </View>
                </View>

                {/* Second Staff */}
                <View style={lessonPlayerStyles.staff}>
                  {/* Staff Lines */}
                  {[1, 2, 3, 4, 5].map((line) => (
                    <View key={line} style={lessonPlayerStyles.staffLine} />
                  ))}
                  
                  {/* Treble Clef */}
                  <Text style={lessonPlayerStyles.trebleClef}>𝄞</Text>
                  
                  {/* Notes */}
                  <View style={lessonPlayerStyles.notesContainer}>
                    {staffNotes.slice(8).map((note, index) => {
                      const actualIndex = index + 8;
                      const isActive = actualIndex === currentNoteIndex;
                      const bottomPercent = ((note.position - 1) / 8) * 100;
                      
                      return (
                        <View
                          key={note.id}
                          style={[
                            lessonPlayerStyles.note,
                            {
                              position: 'absolute',
                              left: `${10 + (index * 20)}%`,
                              bottom: `${bottomPercent - 8}%`
                            }
                          ]}
                        >
                          <View style={[
                            lessonPlayerStyles.noteHead,
                            isActive ? lessonPlayerStyles.noteHeadActive : lessonPlayerStyles.noteHeadInactive
                          ]} />
                          <View style={[
                            lessonPlayerStyles.noteStem,
                            isActive ? lessonPlayerStyles.noteStemActive : lessonPlayerStyles.noteStemInactive
                          ]} />
                        </View>
                      );
                    })}
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Floating Bottom Button */}
      <View style={lessonPlayerStyles.floatingButtonContainer}>
        <Pressable style={({ pressed }) => [lessonPlayerStyles.floatingButton, { opacity: pressed ? 0.8 : 1 }]}>
          <Text style={lessonPlayerStyles.floatingButtonText}>Start Guided Practice</Text>
        </Pressable>
      </View>
    </View>
  );
}
