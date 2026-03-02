# TunePath Design System

## 🎨 Overview

This directory contains the centralized design system for TunePath, ensuring consistency across all screens and components.

## 📁 Structure

```
src/styles/
├── theme.ts          # Core design system (colors, typography, spacing)
├── homeStyles.ts     # Home screen specific styles
├── commonStyles.ts   # Shared component styles (future)
└── README.md         # This documentation
```

## 🎯 Design System Features

### **🎨 Colors**
- **Primary**: `#9810FA` (TunePath purple)
- **Background**: `#F5F5F5` (Light gray)
- **White**: `#FFFFFF` (Pure white)
- **Text**: Primary, secondary, light variants
- **Border**: Light, medium, dark variants
- **Shadow**: Consistent shadow system

### **📝 Typography**
- **Font Family**: Inter
- **Font Weights**: 300, 400, 500, 600, 700
- **Font Sizes**: 12px - 28px scale
- **Letter Spacing**: Tight, normal, wide

### **📏 Spacing**
- **Scale**: 4px, 8px, 12px, 16px, 20px, 24px, 32px, 48px
- **Usage**: Consistent margins and padding

### **🔄 Border Radius**
- **Scale**: 4px, 8px, 12px, 16px, 20px
- **Usage**: Buttons, cards, inputs, avatars

## 🧩 Component Styles

### **📱 Cards**
- **Background**: White with subtle shadows
- **Border Radius**: 20px for large cards
- **Elevation**: 4dp for Android depth

### **🎯 Buttons**
- **Primary**: Purple background, white text
- **Secondary**: White background, border, colored text
- **Press State**: 0.8 opacity feedback

### **👤 Avatars**
- **Small**: 40x40px
- **Medium**: 60x60px  
- **Large**: 67x67px (profile size)

### **🔤 Icons**
- **Small**: 16x16px
- **Medium**: 20x20px
- **Large**: 24x24px

## 📱 Layout Patterns

### **🏠 Container**
- **Flex**: Full screen layout
- **Background**: Light gray theme

### **📋 Header**
- **White background**: Bottom border separation
- **Padding**: 24px horizontal, 16px vertical

### **📄 Sections**
- **White cards**: Consistent shadow and radius
- **Margins**: 24px horizontal spacing

### **📋 List Items**
- **Horizontal layout**: Icon + content + chevron
- **Padding**: 16px vertical, 16px horizontal
- **Border**: Subtle bottom divider

## 🎨 Usage Examples

### **Import Design System**
```typescript
import { DesignSystem } from '../src/styles/theme';
import { homeStyles } from '../src/styles/homeStyles';
```

### **Use Colors**
```typescript
backgroundColor: DesignSystem.colors.background,
color: DesignSystem.colors.text.primary,
borderColor: DesignSystem.colors.border.light,
```

### **Use Typography**
```typescript
fontSize: DesignSystem.typography.fontSizes.base,
fontWeight: DesignSystem.typography.fontWeights.medium,
fontFamily: DesignSystem.typography.fontFamily,
letterSpacing: DesignSystem.typography.letterSpacing.tight,
```

### **Use Spacing**
```typescript
paddingHorizontal: DesignSystem.spacing.xl,
marginVertical: DesignSystem.spacing.lg,
gap: DesignSystem.spacing.md,
```

### **Use Components**
```typescript
// Card style
...DesignSystem.components.card,

// Button style
...DesignSystem.components.button.primary,

// Avatar style
...DesignSystem.components.avatar.large,
```

## 🔄 Helper Functions

### **createTextStyle**
Creates consistent text styling with size, weight, and color.

### **createButtonStyle**
Creates button styles with press state handling.

### **createCardStyle**
Creates card styles with additional customizations.

## 🎯 Benefits

1. **Consistency**: All screens use same design tokens
2. **Maintainability**: Update colors/fonts in one place
3. **Scalability**: Easy to add new components
4. **Type Safety**: Full TypeScript support
5. **Performance**: Optimized style calculations
6. **Organization**: Clean, modular structure

## 📱 Implementation Status

- ✅ **Theme System**: Complete with all design tokens
- ✅ **Home Styles**: Refactored to use design system
- ✅ **Welcome Styles**: Refactored to use design system
- ✅ **Select Instrument Styles**: Refactored to use design system
- ✅ **Select Level Styles**: Refactored to use design system
- ✅ **TypeScript**: Full type safety
- ✅ **Centralized Exports**: All styles available from index
- 🔄 **Other Screens**: Need migration to design system

## 🎯 Migrated Screens

### **✅ Completed Migration:**
1. **Home Screen** (`app/home.tsx`)
   - Uses `homeStyles` from design system
   - Consistent spacing and typography
   - Reusable component patterns

2. **Welcome Screen** (`app/screens/app-main/welcome.tsx`)
   - Uses `welcomeStyles` from design system
   - Gradient background and centered layout
   - Consistent button and text styling

3. **Select Instrument Screen** (`app/screens/app-main/select-instrument.tsx`)
   - Uses `selectInstrumentStyles` from design system
   - Card-based layout with consistent spacing
   - Responsive grid layout

4. **Select Level Screen** (`app/screens/app-main/select-level.tsx`)
   - Uses `selectLevelStyles` from design system
   - Card-based layout with consistent spacing
   - Responsive grid layout

## 🔄 Benefits Achieved

1. **🎨 Consistency**: All migrated screens use same design tokens
2. **🔧 Maintainability**: Update colors/fonts in one place
3. **📱 Scalability**: Easy to add new components
4. **🛡️ Type Safety**: Full TypeScript support
5. **⚡ Performance**: Optimized style calculations
6. **📦 Organization**: Clean, modular structure

## 🚀 Next Steps

1. **Migrate remaining screens**:
   - Sign In/Sign Up screens
   - Lesson Player screen
   - Any other screens in `app/screens/app-main/`

2. **Create shared components**:
   - Common button styles
   - Input field styles
   - Card components

3. **Add responsive design**:
   - Breakpoint-specific styles
   - Adaptive layouts

---

**4 major screens successfully migrated to centralized design system!** 🎨

**Ready to extend to remaining screens!** 🚀

---

**This design system ensures every screen in TunePath looks and feels consistent!** 🎨
