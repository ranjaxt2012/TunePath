# App Main Screens

This folder contains the main application screens for TunePath, organized by screen name.

## Structure

```
app/screens/app-main/
├── welcome.tsx              # Welcome screen with gradient background
├── select-instrument.tsx     # Instrument selection screen
├── select-level.tsx          # Level selection screen
├── home.tsx                 # Home screen with profile and settings
├── lesson-player.tsx         # Lesson player screen
├── onboarding.tsx           # Onboarding flow (to be created)
├── login.tsx                # Login screen (to be created)
├── signup.tsx               # Signup screen (to be created)
├── profile.tsx              # User profile screen (to be created)
├── index.ts                 # Export all screens
└── README.md                # This file
```

## Screen Details

### welcome.tsx
- **Purpose**: Initial welcome screen for new users
- **Features**: Gradient background, logo, title, subtitle, CTA button
- **Figma**: Based on "01 - Welcome" screen from TunePath Master Flow
- **Status**: ✅ Implemented
- **Navigation**: Routes to sign-in screen

### select-instrument.tsx
- **Purpose**: Instrument selection for personalization
- **Features**: 6 instrument options (Harmonium, Guitar, Piano, Vocals, Tabla, Violin)
- **Figma**: Based on "03 - Select Instrument" screen from TunePath Master Flow
- **Status**: ✅ Implemented
- **Navigation**: Routes to select-level screen
- **Design**: Frosted glass cards with icons

### select-level.tsx
- **Purpose**: Skill level selection for personalized experience
- **Features**: 3 level options (Beginner, Intermediate, Advanced)
- **Figma**: Based on "04 - Select Level" screen from TunePath Master Flow
- **Status**: ✅ Implemented
- **Navigation**: Routes to sign-in screen
- **Design**: Frosted glass cards with descriptions

### home.tsx
- **Purpose**: Main home screen after onboarding
- **Features**: Profile card, settings section, instrument/level management
- **Figma**: Based on "05 - Home (After Onboarding)" screen from TunePath Master Flow
- **Status**: ✅ Implemented
- **Navigation**: Routes to select-instrument/select-level screens
- **Design**: Clean white cards with profile avatar

### lesson-player.tsx
- **Purpose**: Lesson player and learning interface
- **Features**: Current lesson card, explore all lessons button
- **Figma**: Based on "07 - Lesson Player" screen from TunePath Master Flow
- **Status**: ✅ Implemented
- **Navigation**: Routes to home screen
- **Design**: Gradient background with frosted glass elements

### Future Screens
- **onboarding**: User onboarding flow
- **login**: User authentication
- **signup**: New user registration
- **home**: Main application interface
- **profile**: User profile management

## Design System

### Colors
- **Primary**: `#9810FA` (Purple)
- **Background**: Gradient (purple to blue)
- **White**: `#FFFFFF` (for text and buttons)
- **Glass**: `rgba(255, 255, 255, 0.1)` (container background)
- **Borders**: `rgba(255, 255, 255, 0.2)` (container borders)

### Typography
- **Title**: 36px, Inter, Semi-bold (600)
- **Subtitle**: 18px, Inter, Regular (400)
- **Card Title**: 20px, Inter, Medium (500)
- **Card Subtitle**: 14px, Inter, Regular (400)
- **Button Text**: 16px, Inter, Medium (500)

### Components
- **Containers**: Frosted glass with rounded corners
- **Cards**: Glass effect with subtle borders and shadows
- **Buttons**: White background with purple text
- **Icons**: Emoji representations of instruments

## Navigation Flow

```
Welcome → Sign In/Sign Up → Select Instrument → Select Level → Home → Lesson Player
```

1. **Welcome**: "Get Started" → Sign In
2. **Sign In/Sign Up**: Authentication → Select Instrument  
3. **Select Instrument**: Any instrument → Select Level
4. **Select Level**: Any level → Home
5. **Home**: Settings/Profile → Select Instrument/Level or Lesson Player
6. **Lesson Player**: Continue learning → Home/Explore Lessons

### Current Working Flow:
- ✅ **Welcome → Sign In**: Working with Pressable
- ✅ **Sign In → Select Instrument**: Working with Pressable  
- ✅ **Sign Up → Select Instrument**: Working with Pressable
- ✅ **Select Instrument → Select Level**: Working with Pressable
- ✅ **Select Level → Sign In**: Working with Pressable
- ✅ **Home → Select Instrument/Level**: Working with Pressable
- ✅ **Lesson Player → Home**: Working with Pressable

## Usage

```typescript
import { 
  WelcomeScreen, 
  SelectInstrumentScreen, 
  SelectLevelScreen, 
  HomeScreen, 
  LessonPlayerScreen 
} from '../screens/app-main';
```

## Implementation Notes

### Navigation
- Using `useRouter` hook for programmatic navigation
- Touch handlers for interactive elements
- Proper TypeScript typing with `as any` for router.push

### Styling
- Consistent gradient backgrounds across all screens
- Frosted glass effect with `rgba(255, 255, 255, 0.1)`
- Proper shadows and border radius
- Inter font family throughout

### Responsive Design
- Flexible layouts that adapt to screen sizes
- Touch-friendly button sizes
- Proper spacing and alignment

## Next Steps

1. **Add form validation** for authentication screens
2. **Implement actual navigation** between screens
3. **Add loading states** for async operations
4. **Integrate with backend** services
5. **Add animations** for screen transitions
6. **Test on different devices** and platforms
