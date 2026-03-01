# Authentication Screens

This folder contains the authentication-related screens for TunePath, organized in the `(auth)` route group.

## Structure

```
app/(auth)/
├── _layout.tsx          # Auth route layout
├── sign-in.tsx          # Sign In screen
├── sign-up.tsx          # Sign Up screen
└── README.md            # This file
```

## Screens

### Sign In Screen (`sign-in.tsx`)
- **Purpose**: User authentication for existing accounts
- **Features**: 
  - Email and password input fields
  - Frosted glass container effect
  - Gradient background
  - Navigation to Sign Up and Select Instrument
- **Figma**: Based on "02A - Sign In" screen
- **Status**: ✅ Implemented
- **Navigation**: "Sign In" → Select Instrument, "Sign Up" link → Sign Up

### Sign Up Screen (`sign-up.tsx`)
- **Purpose**: New user registration
- **Features**:
  - Full name, email, and password inputs
  - Terms and Privacy Policy links
  - Frosted glass container effect
  - Gradient background
  - Navigation to Sign In and Select Instrument
- **Figma**: Based on "02B - Sign Up" screen
- **Status**: ✅ Implemented
- **Navigation**: "Create Account" → Select Instrument, "Sign In" link → Sign In

## Design System

### Colors
- **Primary**: `#9810FA` (Purple)
- **Background**: Gradient (purple to blue)
- **White**: `#FFFFFF` (for text and buttons)
- **Glass**: `rgba(255, 255, 255, 0.1)` (container background)
- **Borders**: `rgba(255, 255, 255, 0.2)` (container borders)

### Typography
- **Title**: 28px, Inter, Medium (500)
- **Subtitle**: 15px, Inter, Regular (400)
- **Input Text**: 14px, Inter, Regular (400)
- **Button Text**: 17px, Inter, Semi-bold (600)
- **Link Text**: 16px, Inter, Medium (500)

### Components
- **Containers**: Frosted glass with rounded corners
- **Inputs**: Glass effect with subtle borders
- **Buttons**: White background with purple text
- **Links**: Underlined white text

## Navigation

### From Welcome Screen
- **Get Started** → Sign In screen
- **Test Sign Up** → Sign Up screen

### Between Auth Screens
- **Sign Up** link → Sign Up screen
- **Sign In** link → Sign In screen

## Usage

```typescript
// Navigate to Sign In
<Link href="/(auth)/sign-in" asChild>
  <Button>Sign In</Button>
</Link>

// Navigate to Sign Up
<Link href="/(auth)/sign-up" asChild>
  <Button>Sign Up</Button>
</Link>
```

## Next Steps

1. **Add form validation** for email and password
2. **Implement authentication logic** with backend
3. **Add loading states** for form submission
4. **Handle error states** and user feedback
5. **Add social login options** (Google, Apple, etc.)
6. **Implement password recovery** flow

## Testing

- Test navigation between screens
- Verify form inputs are accessible
- Check responsive design on different screen sizes
- Test on iOS, Android, and Web platforms
