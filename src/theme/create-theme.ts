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

  typography: {
    fontFamily:
      '"Inter", "Segoe UI", "Helvetica", "Arial", sans-serif',
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        "*": {
          scrollbarWidth: "thin",
          scrollbarColor: "#CBD5E1 transparent",
        },
        "*::-webkit-scrollbar": {
          width: "7px",
          height: "7px",
        },
        "*::-webkit-scrollbar-track": {
          background: "transparent",
          borderRadius: "10px",
        },
        "*::-webkit-scrollbar-thumb": {
          background: "#CBD5E1",
          borderRadius: "10px",
          transition: "background-color 0.2s ease-in-out",
        },
        "*::-webkit-scrollbar-thumb:hover": {
          background: "#94A3B8",
        },
        "*::-webkit-scrollbar-thumb:active": {
          background: "#6D5DF6",
        },
        "*::-webkit-scrollbar-corner": {
          background: "transparent",
        },
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: {
          "&.Mui-disabled": {
            opacity: 1,
            color: "#334155",
            fontWeight: 600,
          },
        },
      },
    },
  },
});