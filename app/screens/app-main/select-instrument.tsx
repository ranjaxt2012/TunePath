import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function SelectInstrumentScreen() {
  const router = useRouter();
  
  const handleInstrumentSelect = (instrument: string) => {
    console.log('Instrument selected:', instrument);
    router.push('/select-level' as any);
  };

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <View style={styles.backgroundGradient}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Choose Your Instrument</Text>
          <Text style={styles.subtitle}>Select your instrument to get started.</Text>
        </View>

        {/* Instrument Options */}
        <View style={styles.instrumentsContainer}>
          {/* Harmonium */}
          <Pressable 
            style={({ pressed }) => [
              styles.instrumentCard,
              { opacity: pressed ? 0.8 : 1 }
            ]}
            onPress={() => handleInstrumentSelect('harmonium')}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.instrumentIcon}>🎵</Text>
            </View>
            <Text style={styles.instrumentName}>Harmonium</Text>
          </Pressable>

          {/* Guitar */}
          <Pressable 
            style={({ pressed }) => [
              styles.instrumentCard,
              { opacity: pressed ? 0.8 : 1 }
            ]}
            onPress={() => handleInstrumentSelect('guitar')}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.instrumentIcon}>🎸</Text>
            </View>
            <Text style={styles.instrumentName}>Guitar</Text>
          </Pressable>

          {/* Piano */}
          <Pressable 
            style={({ pressed }) => [
              styles.instrumentCard,
              { opacity: pressed ? 0.8 : 1 }
            ]}
            onPress={() => handleInstrumentSelect('piano')}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.instrumentIcon}>🎹</Text>
            </View>
            <Text style={styles.instrumentName}>Piano</Text>
          </Pressable>

          {/* Vocals */}
          <Pressable 
            style={({ pressed }) => [
              styles.instrumentCard,
              { opacity: pressed ? 0.8 : 1 }
            ]}
            onPress={() => handleInstrumentSelect('vocals')}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.instrumentIcon}>🎤</Text>
            </View>
            <Text style={styles.instrumentName}>Vocals</Text>
          </Pressable>

          {/* Tabla */}
          <Pressable 
            style={({ pressed }) => [
              styles.instrumentCard,
              { opacity: pressed ? 0.8 : 1 }
            ]}
            onPress={() => handleInstrumentSelect('tabla')}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.instrumentIcon}>🪘</Text>
            </View>
            <Text style={styles.instrumentName}>Tabla</Text>
          </Pressable>

          {/* Violin */}
          <Pressable 
            style={({ pressed }) => [
              styles.instrumentCard,
              { opacity: pressed ? 0.8 : 1 }
            ]}
            onPress={() => handleInstrumentSelect('violin')}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.instrumentIcon}>🎻</Text>
            </View>
            <Text style={styles.instrumentName}>Violin</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Gradient background: linear-gradient(180deg, rgba(152, 16, 250, 1) 0%, rgba(173, 70, 255, 1) 50%, rgba(43, 127, 255, 1) 100%)
    backgroundColor: '#9810FA',
  },
  backgroundGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 48,
    gap: 12,
  },
  title: {
    fontSize: 36,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 28,
  },
  instrumentsContainer: {
    flexDirection: 'column',
    gap: 12,
    alignItems: 'stretch',
  },
  instrumentCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 24,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  instrumentIcon: {
    fontSize: 24,
    color: '#9810FA',
  },
  instrumentName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    flex: 1,
  },
});
