---
name: Industrial Terminal
colors:
  surface: '#19120a'
  surface-dim: '#19120a'
  surface-bright: '#40382e'
  surface-container-lowest: '#130d06'
  surface-container-low: '#211a12'
  surface-container: '#251e16'
  surface-container-high: '#302920'
  surface-container-highest: '#3c332a'
  on-surface: '#eee0d2'
  on-surface-variant: '#d7c3ae'
  inverse-surface: '#eee0d2'
  inverse-on-surface: '#372f26'
  outline: '#9f8e7a'
  outline-variant: '#524534'
  surface-tint: '#ffb955'
  primary: '#ffc880'
  on-primary: '#452b00'
  primary-container: '#f5a623'
  on-primary-container: '#644000'
  inverse-primary: '#835500'
  secondary: '#5dff3b'
  on-secondary: '#063900'
  secondary-container: '#30e200'
  on-secondary-container: '#0f5e00'
  tertiary: '#9bd9ff'
  on-tertiary: '#00344a'
  tertiary-container: '#3ac2ff'
  on-tertiary-container: '#004d6a'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffddb4'
  primary-fixed-dim: '#ffb955'
  on-primary-fixed: '#291800'
  on-primary-fixed-variant: '#633f00'
  secondary-fixed: '#79ff59'
  secondary-fixed-dim: '#34e507'
  on-secondary-fixed: '#022100'
  on-secondary-fixed-variant: '#0c5300'
  tertiary-fixed: '#c4e7ff'
  tertiary-fixed-dim: '#7cd0ff'
  on-tertiary-fixed: '#001e2c'
  on-tertiary-fixed-variant: '#004c69'
  background: '#19120a'
  on-background: '#eee0d2'
  surface-variant: '#3c332a'
typography:
  display-lg:
    fontFamily: JetBrains Mono
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: JetBrains Mono
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: JetBrains Mono
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.1em
  status-code:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
spacing:
  unit: 8px
  gutter: 16px
  margin: 24px
  container-max: 1280px
---

## Brand & Style
The design system is rooted in the high-performance intersection of sports data and terminal aesthetics. It evokes a sense of raw precision, technical authority, and industrial efficiency. The visual language is unapologetically functional, drawing from Neo-Brutalist and CLI (Command Line Interface) influences to create a "broadcast-tech" atmosphere.

The target audience—sports enthusiasts and tech-forward creators—should feel they are operating a professional-grade generator, not just a consumer app. The experience is defined by hard edges, high-contrast layouts, and a deliberate lack of ornamentation, ensuring the focus remains entirely on the generated content and data streams.

## Colors
The palette is built on a "True Black" foundation to ensure maximum depth and contrast on digital displays. Surfaces utilize a dark charcoal to differentiate between the background and interactive containers. 

The primary accent is a Muted Amber, used for high-priority actions and branding elements to evoke a classic industrial warning or status light. Terminal Green is reserved strictly for active states, successful connections, and "live" indicators, providing a vibrant high-tech punch against the monochromatic base. All interactive borders utilize a consistent 1px stroke to define the grid.

## Typography
The typographic hierarchy relies on a dual-font strategy. **JetBrains Mono** provides the technical, data-driven framework. It must be used for all headlines, status labels, and metadata. To enhance the terminal feel, these elements should frequently employ uppercase styling and tightened or expanded tracking depending on the hierarchy level.

**Inter** handles the heavy lifting for readability. All body copy, podcast descriptions, and user-generated text use Inter to provide a modern, clean contrast to the rigid monospaced headers. This balance ensures that while the system looks technical, it remains highly legible for long-form consumption.

## Layout & Spacing
This design system utilizes a rigid 8px baseline grid. Layouts are strictly compartmentalized, mimicking a dashboard or terminal interface. 

- **Grid System:** A 12-column fluid grid is used for desktop, but every module is encased in a 1px border. No "floating" elements are allowed; everything must be anchored to a container.
- **Spacing Rhythm:** Use 16px (2 units) for internal component padding and 32px (4 units) for sectional spacing. 
- **Reflow:** On mobile, the 12-column grid collapses to a single-column stack. Borders remain visible to separate content modules, maintaining the "boxed" industrial aesthetic across all screen sizes.

## Elevation & Depth
Elevation is expressed through **layering and borders**, never through shadows or blurs. This is a flat, Brutalist-inspired environment.

- **Stacking:** Depth is communicated by stacking containers. A primary surface (#1A1A1A) sits on the background (#0D0D0D). If a modal or pop-over is required, it uses the same surface color but is defined by a thicker or higher-contrast border (e.g., changing the border from #333333 to #888888).
- **Hard Transitions:** Transitions between states should be instant. Avoid soft fades; lean into the "analog-to-digital" snap of terminal interfaces.

## Shapes
The shape language is strictly **Sharp**. There are zero rounded corners in the design system. This reinforces the industrial, unrefined, and technical nature of the brand. Every button, input field, and card must have 90-degree angles. Any "pill" or "circle" elements (common in social apps) are strictly forbidden here; use rectangular tags instead.

## Components
- **Buttons:** Rectangular with a 1px border (#333333). Default state is dark charcoal. Hover state shifts the border to Off-White. Active/Selected state fills the background with Terminal Green or Muted Amber with black text.
- **Input Fields:** Styled as terminal prompts. Use a " > " prefix for active text fields. No background fill—only a bottom border or full 1px outline.
- **Cards:** Simple 1px outlined boxes. Use a "Header" section within the card separated by a horizontal 1px line to house JetBrains Mono labels.
- **Chips/Tags:** Small rectangular boxes with uppercase monospaced text. No rounding.
- **Progress Bars:** Blocky, segmented steps rather than a smooth continuous fill, reinforcing the "low-fi" data aesthetic.
- **Checkboxes/Radios:** Square boxes for both. "Checked" state is a solid block fill of Terminal Green.