// theme.js
// Design tokens — THEME_A ("A · Rolig"), kopieret ordret fra prototypen.
// Behold oklch-værdier. THEME_B ("Frisk") er bevidst udeladt; vi bygger efter A.

export const THEME = {
  key: 'a',
  font: "'Schibsted Grotesk', system-ui, sans-serif",
  display: "'Schibsted Grotesk', system-ui, sans-serif",
  displayWeight: 700,

  bg: 'oklch(0.985 0.004 170)',
  surface: '#ffffff',
  card: '#ffffff',
  text: 'oklch(0.28 0.018 185)',
  muted: 'oklch(0.55 0.014 185)',
  faint: 'oklch(0.72 0.01 185)',
  line: 'oklch(0.925 0.006 185)',
  accent: 'oklch(0.60 0.085 168)',
  accentDeep: 'oklch(0.50 0.09 168)',
  accentSoft: 'oklch(0.955 0.03 168)',
  accentText: '#ffffff',
  done: 'oklch(0.62 0.09 165)',
  chipBg: 'oklch(0.965 0.008 185)',
  chipText: 'oklch(0.46 0.02 185)',
  boughtBg: 'oklch(0.935 0.007 185)',
  destructive: 'oklch(0.57 0.18 25)',

  radius: 22,
  cardRadius: 20,
  shadow: '0 1px 2px rgba(20,40,35,0.04), 0 8px 24px -12px rgba(20,40,35,0.10)',
  colorChips: false,
};
