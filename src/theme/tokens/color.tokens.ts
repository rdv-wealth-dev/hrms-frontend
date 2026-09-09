// src/theme/tokens/color.tokens.ts

export const brandColors = {
  primary: {
    lighter: "rgba(109, 93, 246, 0.08)",
    light: "#818CF8",
    main: "#6D5DF6",
    dark: "#5B4BEA",
    darker: "#4338CA",
    contrastText: "#FFFFFF",
  },
} as const;

export const neutralColors = {
  50: "#F8FAFC",
  100: "#F1F5F9",
  200: "#E2E8F0",
  300: "#CBD5E1",
  400: "#94A3B8",
  500: "#64748B",
  600: "#475569",
  700: "#334155",
  800: "#1E293B",
  900: "#0F172A",
} as const;

export const lightPaletteTokens = {
  mode: "light" as const,
  primary: brandColors.primary,
  divider: neutralColors[200], // #E2E8F0
  background: {
    default: "#FFFFFF",
    paper: "#FCFCFD",
  },
  text: {
    primary: "#111827", // Charcoal/Dark Slate
    secondary: "#6B7280", // Slate gray
  },
  neutral: neutralColors,
};

export const darkPaletteTokens = {
  mode: "dark" as const,
  primary: brandColors.primary,
  divider: "rgba(255, 255, 255, 0.12)",
  background: {
    default: "#0B0F19",
    paper: "#111827",
  },
  text: {
    primary: "#F9FAFB",
    secondary: "#9CA3AF",
  },
  neutral: neutralColors,
};
