// src/theme/theme-config.ts
import { lightPaletteTokens, darkPaletteTokens, brandColors } from "./tokens/color.tokens";

export const themeConfig = {
  palette: {
    primary: lightPaletteTokens.primary,
    divider: lightPaletteTokens.divider,
    background: lightPaletteTokens.background,
    text: lightPaletteTokens.text,
    neutral: lightPaletteTokens.neutral,
  },
  darkPalette: darkPaletteTokens,
  brand: brandColors,
};

export type ThemeConfig = typeof themeConfig;
