/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "outline-variant": "#524534",
        "primary-container": "#f5a623",
        "surface-container-lowest": "#130d06",
        "on-primary-fixed": "#291800",
        "background": "#19120a",
        "on-secondary-fixed-variant": "#0c5300",
        "primary-fixed": "#ffddb4",
        "on-tertiary": "#00344a",
        "tertiary-fixed": "#c4e7ff",
        "tertiary-container": "#3ac2ff",
        "secondary-fixed-dim": "#34e507",
        "on-tertiary-fixed": "#001e2c",
        "on-primary": "#452b00",
        "on-tertiary-fixed-variant": "#004c69",
        "secondary-fixed": "#79ff59",
        "surface-tint": "#ffb955",
        "inverse-primary": "#835500",
        "on-primary-container": "#644000",
        "inverse-on-surface": "#372f26",
        "on-secondary-fixed": "#022100",
        "on-error": "#690005",
        "on-secondary": "#063900",
        "on-secondary-container": "#0f5e00",
        "outline": "#9f8e7a",
        "on-tertiary-container": "#004d6a",
        "secondary-container": "#30e200",
        "surface-bright": "#40382e",
        "on-background": "#eee0d2",
        "surface-container-high": "#302920",
        "tertiary-fixed-dim": "#7cd0ff",
        "primary": "#ffc880",
        "surface-container": "#251e16",
        "surface": "#19120a",
        "on-error-container": "#ffdad6",
        "on-primary-fixed-variant": "#633f00",
        "surface-dim": "#19120a",
        "error-container": "#93000a",
        "error": "#ffb4ab",
        "surface-container-highest": "#3c332a",
        "inverse-surface": "#eee0d2",
        "surface-variant": "#3c332a",
        "on-surface-variant": "#d7c3ae",
        "surface-container-low": "#211a12",
        "secondary": "#5dff3b",
        "on-surface": "#eee0d2",
        "primary-fixed-dim": "#ffb955",
        "tertiary": "#9bd9ff"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "container-max": "1280px",
        "gutter": "16px",
        "unit": "8px",
        "margin": "24px"
      },
      fontFamily: {
        "headline-md": ["JetBrains Mono", "monospace"],
        "status-code": ["JetBrains Mono", "monospace"],
        "label-caps": ["JetBrains Mono", "monospace"],
        "display-lg": ["JetBrains Mono", "monospace"],
        "body-lg": ["Inter", "sans-serif"],
        "headline-lg": ["JetBrains Mono", "monospace"],
        "body-md": ["Inter", "sans-serif"]
      },
      fontSize: {
        "headline-md": ["24px", { "lineHeight": "1.2", "fontWeight": "600" }],
        "status-code": ["14px", { "lineHeight": "1.4", "fontWeight": "500" }],
        "label-caps": ["12px", { "lineHeight": "1.0", "letterSpacing": "0.1em", "fontWeight": "600" }],
        "display-lg": ["48px", { "lineHeight": "1.1", "letterSpacing": "-0.02em", "fontWeight": "700" }],
        "body-lg": ["18px", { "lineHeight": "1.6", "fontWeight": "400" }],
        "headline-lg": ["32px", { "lineHeight": "1.2", "fontWeight": "700" }],
        "body-md": ["16px", { "lineHeight": "1.5", "fontWeight": "400" }]
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
}
