---
name: Agro-Modernism
colors:
  surface: '#f0fdf2'
  surface-dim: '#d0ddd3'
  surface-bright: '#f0fdf2'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eaf7ec'
  surface-container: '#e4f1e7'
  surface-container-high: '#deebe1'
  surface-container-highest: '#d9e6dc'
  on-surface: '#131e18'
  on-surface-variant: '#404944'
  inverse-surface: '#28332c'
  inverse-on-surface: '#e7f4ea'
  outline: '#717974'
  outline-variant: '#c0c9c2'
  surface-tint: '#366853'
  primary: '#003625'
  on-primary: '#ffffff'
  primary-container: '#1a4d3a'
  on-primary-container: '#89bda4'
  inverse-primary: '#9ed2b9'
  secondary: '#536259'
  on-secondary: '#ffffff'
  secondary-container: '#d1e1d6'
  on-secondary-container: '#55645b'
  tertiary: '#755b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#cea72c'
  on-tertiary-container: '#4f3d00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b9eed4'
  primary-fixed-dim: '#9ed2b9'
  on-primary-fixed: '#002115'
  on-primary-fixed-variant: '#1d4f3c'
  secondary-fixed: '#d6e6db'
  secondary-fixed-dim: '#bacac0'
  on-secondary-fixed: '#111e18'
  on-secondary-fixed-variant: '#3c4a42'
  tertiary-fixed: '#ffe08e'
  tertiary-fixed-dim: '#ecc246'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#584400'
  background: '#f0fdf2'
  on-background: '#131e18'
  surface-variant: '#d9e6dc'
typography:
  display-lg:
    fontFamily: DM Sans
    fontSize: 52px
    fontWeight: '700'
    lineHeight: '1.06'
    letterSpacing: -0.035em
  display-lg-mobile:
    fontFamily: DM Sans
    fontSize: 34px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: DM Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.03em
  headline-sm:
    fontFamily: DM Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  body-base:
    fontFamily: DM Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  body-sm:
    fontFamily: DM Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  label-eyebrow:
    fontFamily: DM Sans
    fontSize: 11px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.12em
  label-badge:
    fontFamily: DM Sans
    fontSize: 10px
    fontWeight: '700'
    lineHeight: '1.0'
    letterSpacing: 0.06em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  container-max: 1140px
  gutter: 16px
  margin-mobile: 12px
---

## Brand & Style

The design system is a sophisticated blend of **Corporate Modernism** and **Tactile Minimalism**, specifically engineered for the Bulgarian B2B agricultural sector. It bridges the gap between high-tech SaaS efficiency and the grounded, physical reality of farming heritage.

The visual narrative is built on two distinct but harmonious modes:
- **Professional Tech:** A clean, structural framework using heavy whitespace, crisp charcoal lines, and deep forest tones to establish institutional trust and digital reliability.
- **Agricultural Heritage:** A specialized "Yellow Pages" (Жълти страници) tactile aesthetic that utilizes warm parchment textures and harvest-gold accents to mimic physical bulletin boards, ensuring the platform feels locally relevant and accessible to traditional farmers.

The interface must feel rugged yet refined—capable of operating in a high-stakes trading environment while remaining legible in high-glare, outdoor agricultural settings.

## Colors

The palette is rooted in the "Earth and Harvest" philosophy.

- **Primary (Forest Green):** Represents growth and stability. Used for core branding and primary calls to action.
- **Secondary (Slate/Charcoal):** Provides a professional, tech-forward anchor. Used for navigation elements and secondary structural components.
- **Tertiary (Harvest Gold):** Symbolizes wheat and value. Reserved for accents, status indicators, and specialized listing highlights.
- **Neutral (Ink/Surface):** A high-contrast charcoal for typography and a very soft, green-tinted off-white for surfaces to reduce eye strain compared to pure white.

For the **Yellow Pages** mode, use a specialized parchment gradient (`#f0dba8` to `#faf6ec`) to create a tactile, paper-like surface for community listings.

## Typography

This design system uses **DM Sans** exclusively for its geometric clarity and exceptional legibility on mobile devices. 

Key Rules:
- **No Light Weights:** To ensure outdoor readability under Bulgarian sun, the minimum font weight used is 400. Headlines should always be 600 or 700.
- **Scanning Clarity:** Use wide letter-spacing (`0.12em`) for eyebrow labels and category badges. This prevents characters from bleeding together on low-resolution mobile screens.
- **Hierarchy:** Display type scales aggressively for desktop to establish authority but collapses into a robust, readable `34px` on mobile.

## Layout & Spacing

The layout follows a **Fluid Grid** model with a maximum content constraint of `1140px` to maintain optimal line lengths for reading.

- **Rhythm:** A 4px baseline grid governs all internal component spacing.
- **Listing Grids:** Use a responsive CSS grid with `repeat(auto-fill, minmax(280px, 1fr))` and a consistent `16px` gap.
- **Mobile Adaption:** Margins reduce from `16px` (desktop) to `12px` (mobile) to maximize horizontal real estate for data-heavy agricultural listings.
- **Touch Targets:** All interactive elements must maintain a minimum height of `44px` to accommodate users in field conditions.

## Elevation & Depth

Visual hierarchy is established through a mix of **Tonal Layering** and **Physical Shadowing**:

- **SaaS Depth:** Uses "Surface-Container" tiers. Cards are pure white on a soft `#f6f8f5` background, separated by a `1px` border in `#dde5df`. Shadows are avoided here in favor of clean outlines.
- **Yellow Pages Depth:** Uses **Tactile Elevation**. Cards in this mode utilize a bottom-heavy solid shadow (`0 3px 0 rgba(0,0,0,0.12)`) and a subtle golden-yellow aura (`0 8px 24px rgba(201, 162, 39, 0.15)`).
- **Navigation:** The header uses **Glassmorphism**—96% opacity with a `12px` backdrop blur—to maintain context while scrolling through dense marketplace listings.

## Shapes

The shape language is "Functional-Soft." A base `0.5rem` (8px) radius is used for standard cards and inputs, providing a modern, approachable feel. 

Special exceptions:
- **Buttons:** Use a `full` (pill-shaped) radius to clearly distinguish them as interactive triggers.
- **Yellow Pages Cards:** Use a tighter `0.25rem` (4px) radius to mimic the cut edges of physical paper or cardstock.
- **Search Inputs:** Use a `full` radius to encourage a "friendly" entry point into the marketplace.

## Components

### Buttons
- **Primary:** Forest Green background, white text, pill-shaped. Height: 48px for main CTAs.
- **Secondary:** Transparent background, `1px` slate border, pill-shaped.
- **Hover States:** Subtle darkening of the background color with a `-2px` vertical lift for tactile feedback.

### Cards (The Yellow Pages Listing)
- **Structure:** 4px top-accent border in Harvest Gold.
- **Background:** Warm parchment gradient.
- **Interaction:** On hover, the border darkens and the golden aura shadow expands.

### Inputs
- **Style:** 44px height, light grey border.
- **Focus:** Transition border to Forest Green and apply a soft green halo (`0 0 0 3px`) using a low-opacity primary color.

### Details Drawer
- A right-aligned sliding panel for offer details.
- Header must be solid Forest Green with a Harvest Gold top-stripe to maintain brand consistency during deep-dives.

### Chips & Badges
- Used for categories (e.g., "Grains", "Equipment"). 
- Styled with `label-badge` typography, high letter-spacing, and subtle background tints based on the category type.