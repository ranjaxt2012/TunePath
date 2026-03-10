import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { INSTRUMENTS } from '../src/constants/instruments';
import { selectInstrumentStyles } from '../src/styles/selectInstrumentStyles';

export default function SelectInstrumentScreen() {
  const router = useRouter();

  const handleInstrumentSelect = async (slug: string) => {
    try {
      await AsyncStorage.setItem('selectedInstrument', slug);
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
          <View style={[selectInstrumentStyles.instrumentsContainer, selectInstrumentStyles.instrumentGrid]}>
            {INSTRUMENTS.map((inst) => (
              <Pressable
                key={inst.slug}
                style={({ pressed }) => [
                  selectInstrumentStyles.instrumentCard,
                  { opacity: pressed ? 0.8 : 1 },
                ]}
                onPress={() => handleInstrumentSelect(inst.slug)}
              >
                <View style={selectInstrumentStyles.iconContainer}>
                  <Text style={selectInstrumentStyles.instrumentIcon}>
                    {inst.slug === 'harmonium' ? '🎵' : inst.slug === 'guitar' ? '🎸' : inst.slug === 'piano' ? '🎹' : inst.slug === 'vocals' ? '🎤' : inst.slug === 'tabla' ? '🪘' : '🎻'}
                  </Text>
                </View>
                <Text style={selectInstrumentStyles.instrumentName}>{inst.title}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}
