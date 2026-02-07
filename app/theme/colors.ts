// Color palette matching the mobile app
// Main brand color: Purple #10368c
const colors = {
  // Purple color scheme (primary brand color)
  purple900: "#080D2E",
  purple800: "#0A1847",
  purple700: "#0C2463",
  purple600: "#10368C", // Main purple
  purple500: "#1847B0",
  purple400: "#3366CC",
  purple300: "#6699DD",
  purple200: "#99BBEE",
  purple100: "#CCDDFF",
  purple50: "#EEF3FF",

  // Legacy teal colors (kept for backward compatibility, mapped to purple)
  teal900: "#080D2E",
  teal800: "#0A1847",
  teal700: "#0C2463",
  teal600: "#10368C",
  teal500: "#1847B0",
  teal400: "#3366CC",
  teal300: "#6699DD",
  teal200: "#99BBEE",
  teal100: "#CCDDFF",
  teal50: "#EEF3FF",

  grey900: "#0F172A",
  grey800: "#1E293B",
  grey700: "#334155",
  grey600: "#475569",
  grey500: "#64748B",
  grey400: "#94A3B8",
  grey300: "#CBD5E1",
  grey200: "#E2E8F0",
  grey100: "#F1F5F9",
  grey50: "#F8FAFC",
  grey40: "#B1B1B1",
  grey30: "#CFCFCF",
  grey20: "#E1E1E1",
  grey10: "#FCFFFD",

  red900: "#7F1D1D",
  red800: "#991B1B",
  red700: "#B91C1C",
  red600: "#DC2626",
  red500: "#EF4444",
  red400: "#F87171",
  red300: "#FCA5A5",
  red200: "#FECACA",
  red100: "#FEE2E2",
  red50: "#FEF2F2",

  navyBlue: "#0D144F",
  black: "#222222",
  green: "#10B981",
  teal: "#10368C", // Now purple
  purple: "#10368C", // Main purple
  blue: "#155CA1",

  yellow: "#DEA32C",
  beige: "#F6D8AE",
  white: "#FFFFFF",
  error: "#EF1448",
  warning: "#D97706",
  success: "#6FD08C",
  accentOcean: "#2F6D80",
  accentBlue: "#0476D0",
  accentTurquoise: "#4CE0D2",
  accentBeige: "#DBBEA1",
  accentSage: "#16576F",
  accentTangerine: "#BA6439",
  accentHoney: "#E0C879",
  background: "#FCFCFC",
  transparent: "transparent",
  whiteRGBA: "rgba(252, 255, 253, 0.9)",
  tealRGBA: "rgba(16, 54, 140, 0.5)", // Now purple RGBA
  purpleRGBA: "rgba(16, 54, 140, 0.5)",
  whiteRGBA50: "rgba(252, 255, 253, 0.5)",
} as const;

export type ColorKey = keyof typeof colors;
export default colors;
