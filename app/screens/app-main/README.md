# App Main Screens

This folder contains the main application screens for TunePath, organized by screen number and purpose.

## Structure

```
app/screens/app-main/
├── 01-welcome.tsx          # Welcome screen with gradient background
├── 02-onboarding.tsx       # Onboarding flow (to be created)
├── 03-login.tsx            # Login screen (to be created)
├── 04-signup.tsx           # Signup screen (to be created)
├── 05-home.tsx             # Main home screen (to be created)
├── 06-profile.tsx          # User profile screen (to be created)
├── index.ts                # Export all screens
└── README.md               # This file
```

## Screen Details

### 01-welcome.tsx
- **Purpose**: Initial welcome screen for new users
- **Features**: Gradient background, logo, title, subtitle, CTA button
- **Figma**: Based on "01 - Welcome" screen from TunePath Master Flow
- **Status**: ✅ Implemented

### Future Screens
- **02-onboarding**: User onboarding flow
- **03-login**: User authentication
- **04-signup**: New user registration
- **05-home**: Main application interface
- **06-profile**: User profile management

## Development Guidelines

1. **Naming**: Use numeric prefix (01-, 02-, etc.) for proper ordering
2. **Figma Integration**: Each screen should match its corresponding Figma design
3. **Responsive**: Ensure all screens work on iOS, Android, and Web
4. **Consistency**: Use the same design system across all screens

## Usage

```typescript
import { WelcomeScreen } from '../screens/app-main';
```

## Next Steps

1. Implement remaining screens from Figma designs
2. Add navigation between screens
3. Integrate with backend services
4. Add animations and transitions
