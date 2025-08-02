# Mobile App Style Guide

> A comprehensive design system for native mobile applications, derived from the Ninja in Brazil web platform design patterns.

## Table of Contents

1. [Design Principles](#design-principles)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Components](#components)
6. [Navigation Patterns](#navigation-patterns)
7. [Platform Adaptations](#platform-adaptations)
8. [Accessibility](#accessibility)
9. [Implementation Guidelines](#implementation-guidelines)

---

## Design Principles

### Core Philosophy
- **Monochrome First**: Clean, elegant interface prioritizing content over decoration
- **Polymath-Focused**: Tools that support continuous learning and skill development
- **Performance**: Fast, responsive interactions that respect users' time
- **Accessibility**: Inclusive design for all users and devices

### Key Principles
1. **Clarity**: Every element serves a purpose
2. **Consistency**: Unified experience across all touchpoints
3. **Efficiency**: Minimize cognitive load and friction
4. **Adaptability**: Graceful scaling across device sizes

---

## Color System

### Primary Palette

```
Light Mode:
• Primary: #0f172a (Slate 900)
• Secondary: #64748b (Slate 500)
• Accent: #2563eb (Blue 600)
• Background: #ffffff (White)
• Secondary Background: #f8fafc (Slate 50)

Dark Mode:
• Primary: #f8fafc (Slate 50)
• Secondary: #94a3b8 (Slate 400)
• Accent: #3b82f6 (Blue 500)
• Background: #0f172a (Slate 900)
• Secondary Background: #1e293b (Slate 800)
```

### Semantic Colors

```
Success: #059669 (Emerald 600)
Warning: #d97706 (Amber 600)
Error: #dc2626 (Red 600)
Info: #2563eb (Blue 600)
```

### Text Colors

```
Light Mode:
• Primary Text: #0f172a
• Secondary Text: #334155
• Muted Text: #64748b

Dark Mode:
• Primary Text: #f8fafc
• Secondary Text: #cbd5e1
• Muted Text: #94a3b8
```

### Mobile App Usage
- Use high contrast ratios (4.5:1 minimum)
- Consider ambient lighting conditions
- Ensure touch targets maintain visual hierarchy
- Test on various device brightness levels

---

## Typography

### Font Hierarchy

#### Display Text
```
H1 - Hero: 28-32pt, Bold, Tight (-0.02em)
H2 - Page Title: 24-28pt, Bold, Tight (-0.02em)
H3 - Section: 20-24pt, Bold, Normal (0em)
H4 - Subsection: 18-20pt, Semibold, Normal (0em)
```

#### Body Text
```
Body Large: 16-18pt, Regular, Relaxed (0.02em)
Body Base: 14-16pt, Regular, Normal (0em)
Body Small: 12-14pt, Regular, Normal (0em)
Caption: 10-12pt, Regular, Normal (0em)
```

#### Interactive Text
```
Button Text: 14-16pt, Medium, Normal (0em)
Link Text: Inherit size, Medium, Underline
Label Text: 12-14pt, Medium, Normal (0em)
```

### Mobile Considerations
- Minimum 14pt for body text on mobile
- Increase line height by 20% for mobile reading
- Prefer medium weight over regular for better screen visibility
- Test readability at arm's length (typical phone usage)

---

## Spacing & Layout

### Base Unit System
```
Base Unit: 4pt
Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96pt
```

### Mobile Grid System
```
Container Padding: 16pt (sides)
Section Spacing: 24-32pt (vertical)
Component Spacing: 16-24pt (vertical)
Element Spacing: 8-12pt (within components)
```

### Touch Targets
```
Minimum: 44pt × 44pt (iOS HIG standard)
Recommended: 48pt × 48pt
Spacing between targets: 8pt minimum
```

### Safe Areas
```
Top: Account for notch/dynamic island
Bottom: Account for home indicator
Sides: 16pt minimum from edges
```

---

## Components

### Buttons

#### Primary Button
```
Style: Filled background, primary color
Size: 48pt height, 16pt horizontal padding
Typography: 16pt Medium
States: Default, Pressed, Disabled, Loading
Border Radius: 8pt
```

#### Secondary Button
```
Style: Outlined, transparent background
Border: 1pt solid, primary color
Size: 44pt height, 16pt horizontal padding
Typography: 16pt Medium
States: Default, Pressed, Disabled
```

#### Ghost Button
```
Style: No background, no border
Size: 40pt height, 12pt horizontal padding
Typography: 16pt Medium
States: Default, Pressed, Disabled
Color: Accent color
```

### Form Elements

#### Text Input
```
Height: 48pt
Padding: 12pt horizontal, 14pt vertical
Border: 1pt solid, border color
Border Radius: 8pt
Typography: 16pt Regular
States: Default, Focused, Error, Disabled
```

#### Dropdown/Picker
```
Height: 48pt
Padding: 12pt horizontal
Border: 1pt solid, border color
Border Radius: 8pt
Typography: 16pt Regular
Icon: Chevron down, 20pt
```

#### Checkbox/Radio
```
Size: 20pt × 20pt
Border: 2pt solid
Border Radius: 4pt (checkbox), 50% (radio)
States: Unchecked, Checked, Indeterminate, Disabled
```

### Cards

#### Basic Card
```
Background: Card background color
Border: 1pt solid, border color
Border Radius: 12pt
Padding: 16pt
Shadow: Subtle (0pt 2pt 8pt rgba(0,0,0,0.1))
```

#### Interactive Card
```
Extends Basic Card
States: Default, Pressed
Animation: Scale down 98% on press
Feedback: Haptic light impact
```

### Navigation

#### Tab Bar (iOS Style)
```
Height: 83pt (49pt + 34pt safe area)
Background: Card background with blur
Items: 3-5 maximum
Icon Size: 24pt
Typography: 10pt Medium
States: Default, Selected
```

#### Navigation Bar
```
Height: 88pt (44pt + 44pt safe area)
Background: Card background with blur
Title: 18pt Bold, centered
Buttons: 44pt touch target
Back Button: Platform standard
```

### Lists

#### List Item
```
Height: 56pt minimum
Padding: 16pt horizontal, 12pt vertical
Separator: 1pt line, border color
Typography: 16pt Regular
Supporting Text: 14pt Secondary color
```

#### Section Header
```
Height: 40pt
Padding: 16pt horizontal, 8pt vertical
Typography: 14pt Medium, Uppercase
Background: Secondary background
```

---

## Navigation Patterns

### Primary Navigation

#### Bottom Tab Bar
```
Structure:
- Home (Dashboard/Overview)
- Track (Progress/Analytics)
- Learn (Resources/Content)
- Profile (Settings/Account)

Visual Treatment:
- Selected: Accent color + label
- Unselected: Secondary color, no label on mobile
- Badge support for notifications
```

#### Navigation Stack
```
Pattern: Push/Pop navigation
Transitions: Slide from right (iOS), Various (Android)
Back Button: Always visible when applicable
Title: Clear hierarchy indication
```

### Secondary Navigation

#### Header Actions
```
Primary Action: Right side, accent color
Secondary Actions: Overflow menu (•••)
Maximum: 2 visible actions + overflow
```

#### Segmented Control
```
Use for: 2-4 related views
Height: 32pt
Typography: 14pt Medium
Background: Secondary background
Selected: Primary background
```

### Modal Patterns

#### Bottom Sheet
```
Entry: Slide up from bottom
Content: Scrollable if needed
Handle: 32pt wide, 4pt tall, centered
Backdrop: Semi-transparent overlay
Dismissal: Swipe down or tap backdrop
```

#### Alert/Dialog
```
Max Width: 280pt
Padding: 16pt
Border Radius: 12pt
Buttons: Stacked on narrow screens
Primary Action: Right side
```

---

## Platform Adaptations

### iOS Specific

#### Visual Design
- Use SF Pro font system
- Respect Dynamic Type preferences
- Implement proper blur effects
- Follow iOS 17+ design patterns

#### Interactions
- Pull-to-refresh on scroll views
- Swipe gestures for navigation
- Haptic feedback for interactions
- Context menus for secondary actions

#### Components
- UINavigationController patterns
- UITabBarController for primary nav
- Native form controls
- System color adaptations

### Android Specific

#### Material Design 3
- Use Material You color system
- Implement proper elevation
- Follow Android 14+ patterns
- Support themed app icons

#### Interactions
- FAB for primary actions
- Swipe-to-delete patterns
- Pull-to-refresh compatibility
- Edge-to-edge design

#### Components
- Navigation Component for routing
- Bottom Navigation View
- Material form components
- Adaptive color schemes

---

## Accessibility

### Visual Accessibility
```
Color Contrast: 4.5:1 minimum (WCAG AA)
Text Size: Support dynamic type scaling
Focus Indicators: Clear, high contrast
Color Independence: Never rely solely on color
```

### Motor Accessibility
```
Touch Targets: 44pt minimum
Gesture Alternatives: Always provide button alternatives
Timing: No auto-timeouts under 20 seconds
Physical: Support switch control and voice control
```

### Cognitive Accessibility
```
Clear Language: Simple, direct copy
Consistent Patterns: Predictable interactions
Error Prevention: Clear validation and guidance
Help: Contextual assistance available
```

### Screen Reader Support
```
Semantic Markup: Proper heading hierarchy
Descriptive Labels: Clear, concise descriptions
State Changes: Announce dynamic content
Navigation: Logical tab order
```

---

## Implementation Guidelines

### Component Library Structure

```
foundation/
  colors.js
  typography.js
  spacing.js
  
components/
  buttons/
    PrimaryButton.js
    SecondaryButton.js
    GhostButton.js
  forms/
    TextInput.js
    Dropdown.js
    Checkbox.js
  navigation/
    TabBar.js
    NavigationBar.js
    BottomSheet.js
  layout/
    Card.js
    List.js
    Section.js
```

### Theme Implementation

```javascript
// Example theme structure
const theme = {
  colors: {
    light: {
      primary: '#0f172a',
      secondary: '#64748b',
      accent: '#2563eb',
      background: '#ffffff',
      // ... rest of color system
    },
    dark: {
      primary: '#f8fafc',
      secondary: '#94a3b8',
      accent: '#3b82f6',
      background: '#0f172a',
      // ... rest of color system
    }
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    // ... rest of spacing scale
  },
  typography: {
    h1: {
      fontSize: 28,
      fontWeight: 'bold',
      lineHeight: 1.2,
    },
    // ... rest of typography scale
  }
};
```

### Development Best Practices

1. **Component Consistency**
   - Use design tokens for all values
   - Implement prop-based variants
   - Include comprehensive prop types

2. **Performance**
   - Optimize re-renders with React.memo
   - Use native driver for animations
   - Implement proper image loading

3. **Testing**
   - Test all interactive states
   - Verify accessibility features
   - Test across device sizes

4. **Documentation**
   - Document component APIs
   - Include usage examples
   - Maintain design change logs

---

## Resources

### Design Tools
- Figma component library (recommended)
- Sketch symbol library
- Adobe XD component sets

### Development Libraries
- React Native Paper (Material Design)
- NativeBase (Cross-platform)
- Tamagui (Performance-focused)
- React Native Elements

### Testing Tools
- Accessibility Inspector (iOS)
- TalkBack (Android)
- Color Contrast Analyzers
- Device testing farms

---

*This style guide is a living document. Regular updates ensure alignment with platform evolution and user feedback.*