# TunePath — Audio Library: expo-av vs expo-audio

## Decision: **expo-av** (current)

We use **expo-av** for all audio playback (sargam samples, lesson sync) on SDK 54.

### Why expo-av for now

| Criteria | expo-av | expo-audio |
|----------|---------|------------|
| **SDK 54** | ✅ Works; no Swift/build issues | ✅ Supported; some iOS seekTo bugs reported |
| **iOS / Android / Web** | ✅ Supported | ✅ Supported |
| **Stability** | ✅ Mature, used in production | ⚠️ Newer; EXC_BAD_ACCESS on seekTo (iOS) in some cases |
| **Music learning (timing, multiple sounds)** | ✅ `Audio.Sound.createAsync` + `downloadFirst`, precise stop/start | ✅ `createAudioPlayer`; API differs |
| **Maintenance** | Deprecated long-term; still works | Actively maintained, recommended by Expo |

**Reasons we stayed on expo-av:**

1. **No “Module has no exported member 'Audio'”** — expo-audio does **not** export `Audio`; it exports `createAudioPlayer`, `setAudioModeAsync`, `useAudioPlayer`, etc. Migrating without updating every call site causes that TS error.
2. **Proven in this app** — SargamPlayerEngine and HarmoniumPlayer already use expo-av with `_stopSoundAsync()` before each new note (no overlap).
3. **expo-audio known issues** — e.g. [EXC_BAD_ACCESS in seekTo on iOS](https://github.com/expo/expo/issues/43034); our engine doesn’t rely on seekTo for one-shot notes, but staying on expo-av avoids risk until those are resolved.
4. **Single stack** — All audio (player + `useHarmoniumSound`) now uses expo-av only; no mixed expo-av/expo-audio.

---

## Current usage (expo-av)

- **HarmoniumPlayer.tsx**  
  `import { Audio } from 'expo-av'`  
  - `Audio.setAudioModeAsync({ playsInSilentModeIOS: true, allowsRecordingIOS: false, staysActiveInBackground: false })`

- **SargamPlayerEngine.ts**  
  `import { Audio } from 'expo-av'`  
  - `Audio.Sound.createAsync(source, { shouldPlay: true, volume: 1.0, positionMillis: 0 }, null, true)`  
  - `sound.setVolumeAsync(0)` → `sound.stopAsync()` → `sound.unloadAsync()` (and awaited `_stopSoundAsync` before next note)

- **useHarmoniumSound.ts**  
  `import { Audio } from 'expo-av'`  
  - `Audio.Sound.createAsync(source, { shouldPlay: true, volume: 1.0 }, null, true)` then `sound.unloadAsync()` after delay

- **Shared assets**  
  `src/instruments/harmonium/sampleMap.ts` exports `HARMONIUM_SAMPLE_MAP` (require() of .mp3s).

---

## Migration plan: expo-av → expo-audio (future)

When you want to move to expo-audio (e.g. after SDK 55+ and iOS fixes):

### 1. Install and config

```bash
npx expo install expo-audio
```

In `app.json` plugins, add (if you need recording):

```json
["expo-audio", { "microphonePermission": "Allow $(PRODUCT_NAME) to access your microphone." }]
```

### 2. API mapping

| expo-av | expo-audio |
|---------|------------|
| `Audio.setAudioModeAsync({ playsInSilentModeIOS, allowsRecordingIOS, staysActiveInBackground })` | `setAudioModeAsync({ playsInSilentMode, allowsRecording, shouldPlayInBackground })` |
| `Audio.Sound.createAsync(source, opts, onStatus, downloadFirst)` | `createAudioPlayer(source, { downloadFirst })` then `player.play()` |
| `sound.setVolumeAsync(0); sound.stopAsync(); sound.unloadAsync()` | `player.pause()` then `player.remove()` |
| `Audio.Sound` type | `AudioPlayer` from `createAudioPlayer` |

Note: expo-audio uses **seconds** for time; expo-av uses `positionMillis`.

### 3. Code changes

- **HarmoniumPlayer**  
  Replace `Audio.setAudioModeAsync` with `setAudioModeAsync` from `expo-audio` (same name, different package).

- **SargamPlayerEngine**  
  - Replace `Audio.Sound.createAsync` with `createAudioPlayer(source, { downloadFirst: true })`.  
  - Replace stop/cleanup with `player.pause()` then `player.remove()`.  
  - No `Audio.Sound` type; use the player instance from `createAudioPlayer`.

- **useHarmoniumSound**  
  Use `createAudioPlayer(source)` then `player.play()`, and `player.remove()` after a timeout (or when playback ends).

### 4. Testing

- **iOS**: Play lesson, sargam sync, speed slider, prev/next; no crash on seek/play.
- **Android**: Same flows; confirm no BOOT_COMPLETED or permission issues.
- **Web** (if used): Verify playback and no console errors.

---

## Testing (current expo-av setup)

1. **iOS**  
   `make dev` → open in simulator or device → open a harmonium lesson → tap play → confirm sargam notes in sync with video and no overlap.

2. **Android**  
   Same flow on Android device/emulator.

3. **TypeScript**  
   `cd TunePath && npx tsc --noEmit`  
   No `"Module has no exported member 'Audio'"` or other audio-related errors.

4. **Health**  
   `make health` (expo-doctor + tsc).
