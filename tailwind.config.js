import plugin from 'tailwindcss/plugin'

// Mobile layout (< 1024px) sizes everything in vw against a 375px design width,
// the same way the reference does: `vw-text-14` = calc(14 / 375 * 100vw).
const vwValues = Object.fromEntries(
  Array.from({ length: 1001 }, (_, n) => [String(n), `calc(${n} / 375 * 100vw)`]),
)
const vwProps = {
  'vw-text': ['fontSize'],
  'vw-leading': ['lineHeight'],
  'vw-p': ['padding'],
  'vw-px': ['paddingLeft', 'paddingRight'],
  'vw-py': ['paddingTop', 'paddingBottom'],
  'vw-pt': ['paddingTop'],
  'vw-pb': ['paddingBottom'],
  'vw-pl': ['paddingLeft'],
  'vw-pr': ['paddingRight'],
  'vw-m': ['margin'],
  'vw-mt': ['marginTop'],
  'vw-mb': ['marginBottom'],
  'vw-ml': ['marginLeft'],
  'vw-mr': ['marginRight'],
  'vw-gap': ['gap'],
  'vw-w': ['width'],
  'vw-h': ['height'],
  'vw-size': ['width', 'height'],
  'vw-rounded': ['borderRadius'],
  'vw-t': ['top'],
  'vw-border': ['borderWidth'],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Splitdesk palette, in the roles the reference layout uses
        primary: '#17181A',
        paper: '#EDF0E8',
        line: '#DFE2D9',
        card: '#F4F5F1',
        'card-hover': '#EDEFE8',
        chip: '#E8EBE3',
        muted: '#73766E',
        hairline: '#EEF0EA',
        accent: '#B6F03C',
        'accent-deep': '#86C21A',
        money: '#1F8A4C',
        'ink-hover': '#2B2E2A',
      },
      fontFamily: {
        sans: ['"Mozilla Text"', 'system-ui', 'sans-serif'],
        JetBrainsMono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        dropdownIn: {
          '0%': { opacity: '0', transform: 'translateY(-12px)' },
          '100%': { opacity: '1', transform: 'translateY(0px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [
    plugin(({ matchUtilities }) => {
      for (const [prefix, props] of Object.entries(vwProps)) {
        matchUtilities(
          { [prefix]: (value) => Object.fromEntries(props.map((p) => [p, value])) },
          { values: vwValues },
        )
      }
    }),
  ],
}
