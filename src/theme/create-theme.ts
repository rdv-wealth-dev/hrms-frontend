// src/theme/create-theme.ts

import { createTheme } from "@mui/material/styles";
import { themeConfig } from "./theme-config";

export const theme = createTheme({
  palette: {
    primary: themeConfig.palette.primary,

    background: {
      default: themeConfig.palette.background.default,
      paper: themeConfig.palette.background.paper,
    },

    text: {
      primary: themeConfig.palette.text.primary,
      secondary: themeConfig.palette.text.secondary,
    },
  },
});