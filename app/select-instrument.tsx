import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { selectInstrumentStyles } from '../src/styles/selectInstrumentStyles';

export default function SelectInstrumentScreen() {
  const router = useRouter();
  
  const handleInstrumentSelect = async (instrument: string) => {
    try {
      await AsyncStorage.setItem('selectedInstrument', instrument);
      router.push('/select-level' as any);
    } catch (error) {
      console.error('Error saving instrument:', error);
    }
  };

  return (
    <View style={selectInstrumentStyles.container}>
      {/* Background gradient */}
      <View style={selectInstrumentStyles.backgroundGradient}>
        {/* Back Button */}
        <View style={selectInstrumentStyles.backButtonContainer}>
          <Pressable 
            style={({ pressed }) => [selectInstrumentStyles.backButton, { opacity: pressed ? 0.8 : 1 }]}
            onPress={() => router.push('/(auth)/sign-in')}
          >
            <Text style={selectInstrumentStyles.backIcon}>‹</Text>
            <Text style={selectInstrumentStyles.backText}>Back</Text>
          </Pressable>
        </View>

        {/* Instrument Options */}
        <View style={selectInstrumentStyles.contentContainer}>
          <View style={selectInstrumentStyles.headerContainer}>
          <Text style={selectInstrumentStyles.title}>Choose Your Instrument</Text>
          <Text style={selectInstrumentStyles.subtitle}>Select your instrument to get started.</Text>
        </View>
          <View style={selectInstrumentStyles.instrumentsContainer}>
            {/* First Row: Harmonium & Guitar */}
            <View style={selectInstrumentStyles.instrumentGrid}>
              {/* Harmonium */}
              <Pressable 
                style={({ pressed }) => [
                  selectInstrumentStyles.instrumentCard,
                  { opacity: pressed ? 0.8 : 1 }
                ]}
                onPress={() => handleInstrumentSelect('harmonium')}
              >
                <View style={selectInstrumentStyles.iconContainer}>
                  <Text style={selectInstrumentStyles.instrumentIcon}>🎵</Text>
                </View>
                <Text style={selectInstrumentStyles.instrumentName}>Harmonium</Text>
              </Pressable>

              {/* Guitar */}
              <Pressable 
                style={({ pressed }) => [
                  selectInstrumentStyles.instrumentCard,
                  { opacity: pressed ? 0.8 : 1 }
                ]}
                onPress={() => handleInstrumentSelect('guitar')}
              >
                <View style={selectInstrumentStyles.iconContainer}>
                  <Text style={selectInstrumentStyles.instrumentIcon}>🎸</Text>
                </View>
                <Text style={selectInstrumentStyles.instrumentName}>Guitar</Text>
              </Pressable>
            </View>

            {/* Second Row: Piano & Vocals */}
            <View style={selectInstrumentStyles.instrumentGrid}>
              {/* Piano */}
              <Pressable 
                style={({ pressed }) => [
                  selectInstrumentStyles.instrumentCard,
                  { opacity: pressed ? 0.8 : 1 }
                ]}
                onPress={() => handleInstrumentSelect('piano')}
              >
                <View style={selectInstrumentStyles.iconContainer}>
                  <Text style={selectInstrumentStyles.instrumentIcon}>🎹</Text>
                </View>
                <Text style={selectInstrumentStyles.instrumentName}>Piano</Text>
              </Pressable>

              {/* Vocals */}
              <Pressable 
                style={({ pressed }) => [
                  selectInstrumentStyles.instrumentCard,
                  { opacity: pressed ? 0.8 : 1 }
                ]}
                onPress={() => handleInstrumentSelect('vocals')}
              >
                <View style={selectInstrumentStyles.iconContainer}>
                  <Text style={selectInstrumentStyles.instrumentIcon}>🎤</Text>
                </View>
                <Text style={selectInstrumentStyles.instrumentName}>Vocals</Text>
              </Pressable>
            </View>

            {/* Third Row: Tabla & Violin */}
            <View style={selectInstrumentStyles.instrumentGrid}>
              {/* Tabla */}
              <Pressable 
                style={({ pressed }) => [
                  selectInstrumentStyles.instrumentCard,
                  { opacity: pressed ? 0.8 : 1 }
                ]}
                onPress={() => handleInstrumentSelect('tabla')}
              >
                <View style={selectInstrumentStyles.iconContainer}>
                  <Text style={selectInstrumentStyles.instrumentIcon}>🪘</Text>
                </View>
                <Text style={selectInstrumentStyles.instrumentName}>Tabla</Text>
              </Pressable>

              {/* Violin */}
              <Pressable 
                style={({ pressed }) => [
                  selectInstrumentStyles.instrumentCard,
                  { opacity: pressed ? 0.8 : 1 }
                ]}
                onPress={() => handleInstrumentSelect('violin')}
              >
                <View style={selectInstrumentStyles.iconContainer}>
                  <Text style={selectInstrumentStyles.instrumentIcon}>🎻</Text>
                </View>
                <Text style={selectInstrumentStyles.instrumentName}>Violin</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
