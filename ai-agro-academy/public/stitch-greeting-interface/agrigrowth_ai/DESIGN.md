---
name: AgriGrowth AI
colors:
  surface: '#f5faf7'
  surface-dim: '#d6dbd8'
  surface-bright: '#f5faf7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f5f2'
  surface-container: '#eaefec'
  surface-container-high: '#e4e9e6'
  surface-container-highest: '#dee4e1'
  on-surface: '#171d1b'
  on-surface-variant: '#3d4a3e'
  inverse-surface: '#2c3230'
  inverse-on-surface: '#edf2ef'
  outline: '#6c7b6d'
  outline-variant: '#bbcbbb'
  surface-tint: '#006d37'
  primary: '#006d37'
  on-primary: '#ffffff'
  primary-container: '#2ecc71'
  on-primary-container: '#005027'
  inverse-primary: '#4ae183'
  secondary: '#366853'
  on-secondary: '#ffffff'
  secondary-container: '#b6ebd1'
  on-secondary-container: '#3b6c57'
  tertiary: '#865300'
  on-tertiary: '#ffffff'
  tertiary-container: '#f8a018'
  on-tertiary-container: '#633c00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#6bfe9c'
  primary-fixed-dim: '#4ae183'
  on-primary-fixed: '#00210c'
  on-primary-fixed-variant: '#005228'
  secondary-fixed: '#b9eed4'
  secondary-fixed-dim: '#9ed2b9'
  on-secondary-fixed: '#002115'
  on-secondary-fixed-variant: '#1d4f3c'
  tertiary-fixed: '#ffddb9'
  tertiary-fixed-dim: '#ffb961'
  on-tertiary-fixed: '#2b1700'
  on-tertiary-fixed-variant: '#663e00'
  background: '#f5faf7'
  on-background: '#171d1b'
  surface-variant: '#dee4e1'
typography:
  headline-xl:
    fontFamily: DM Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: DM Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: DM Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: DM Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: DM Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: DM Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: DM Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: DM Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin: 32px
---

## Brand & Style
The design system embodies "Modern EdTech with an Agricultural Heart." It balances the precision of artificial intelligence with the organic, grounding nature of farming. The visual language is clean and academic, yet vibrating with the energy of growth.

The style is **Corporate / Modern** with subtle organic influences. It prioritizes clarity and information density for educational purposes while using soft geometry and vibrant accents to maintain an approachable, empowering atmosphere. The UI should feel like a premium tool that is both a reliable scientific resource and an intuitive digital mentor.

## Colors
The palette is rooted in the "Growth and Earth" spectrum. 
- **Primary (#2ecc71):** Representing "Growth Green," used for primary actions, success states, and key progress indicators.
- **Secondary (#1a4d3a):** "Forest Depth," used for navigation, headings, and moments requiring professional authority and trust.
- **Tertiary (#f39c12):** "Harvest Amber," used for highlights, warnings, and achievement badges to symbolize reward and sunshine.
- **Background:** A very light mint tint (#F7FCF9) provides a refreshing, "clean air" feel compared to stark white, reducing eye strain during long learning sessions.

## Typography
**DM Sans** is the sole typeface, chosen for its exceptional legibility and modern geometric construction. 
- **Headlines:** Use tight letter-spacing and bold weights in Forest Depth (#1a4d3a) to anchor the page.
- **Body Text:** Ample line height (1.5x+) is maintained to ensure educational content is digestible.
- **Labels:** Used for metadata like "Course Duration" or "AI Tagging," typically using medium to semi-bold weights for quick scanning.

## Layout & Spacing
The layout follows a **12-column fluid grid** for desktop and a **4-column grid** for mobile. 
- **Rhythm:** An 8px base unit drives all padding and margin decisions. 
- **Containers:** Content is housed in "Field Containers" with generous internal padding (24px) to represent the openness of farmland.
- **Responsive Behavior:** On mobile, margins reduce to 16px, and vertical spacing between course cards increases to provide a clear tap target.

## Elevation & Depth
This design system uses **Tonal Layers** combined with **Ambient Shadows** to create a sense of organized hierarchy. 
- **Level 0 (Floor):** The Light Mint background.
- **Level 1 (Cards):** Flat white surfaces with a 1px border in a pale sage green (#E0EADD).
- **Level 2 (Hover/Active):** A soft, diffused shadow (0px 4px 20px rgba(26, 77, 58, 0.08)) is applied to cards to suggest they are "lifted" and ready for interaction.
- **Level 3 (AI Modals):** More pronounced depth using a slightly darker Forest Green tint in the shadow to indicate priority and intelligence.

## Shapes
The shape language is **Rounded**, utilizing an 8px (0.5rem) base radius. This reflects a "Soft Tech" aesthetic—approachable and friendly rather than sharp and industrial. 
- **Standard Elements:** Buttons, input fields, and small cards use 8px.
- **Large Containers:** Course thumbnails and main dashboard cards use 16px (rounded-lg).
- **AI Bubbles:** Use 24px (rounded-xl) on three corners with one sharp corner to indicate the origin of the message, creating a distinct "chat" silhouette.

## Components

### Course Cards
Cards feature a high-aspect-ratio image at the top with 16px rounding. Below the image, the secondary forest green is used for the title. A "Difficulty Tag" (Chip) is placed in the top-right corner using the Harvest Amber (#f39c12) background.

### Progress Bars
Progress tracks use a two-tone green approach: a pale mint background with a vibrant primary green (#2ecc71) fill. The bar is 8px tall with fully rounded ends. For completed courses, the bar turns to Forest Green with a small checkmark icon.

### AI Assistant Interface
The AI Assistant is visually distinct. Chat bubbles from the AI utilize a very subtle gradient from the Light Mint background to a slightly darker sage, with a primary green "sparkle" icon to denote AI-generated content. Input fields for the AI use a 2px border in Forest Green when focused to signal "active listening."

### Buttons
- **Primary:** Solid Growth Green (#2ecc71) with white text. High contrast, bold weight.
- **Secondary:** Outlined Forest Green (#1a4d3a) with 2px borders.
- **Tertiary:** Ghost style with Harvest Amber text for "View Details" or less critical actions.

### Input Fields
Standard inputs have a light background and 1px border. On focus, the border transitions to Growth Green with a soft outer glow (2px) of the same color at 20% opacity.