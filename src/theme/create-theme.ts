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
    fontFamily: '"Inter", "Segoe UI", "Helvetica", "Arial", sans-serif',

    // Fluid heading scale: smaller on mobile, full-size on desktop
    h4: { fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)", fontWeight: 700 },
    h5: { fontSize: "clamp(1rem, 2vw, 1.35rem)", fontWeight: 700 },
    h6: { fontSize: "clamp(0.95rem, 1.8vw, 1.15rem)", fontWeight: 600 },
  },

  components: {
    // ─── Scrollbar ────────────────────────────────────────────
    MuiCssBaseline: {
      styleOverrides: {
        "*": { scrollbarWidth: "thin", scrollbarColor: "#CBD5E1 transparent" },
        "*::-webkit-scrollbar": { width: "7px", height: "7px" },
        "*::-webkit-scrollbar-track": { background: "transparent", borderRadius: "10px" },
        "*::-webkit-scrollbar-thumb": { background: "#CBD5E1", borderRadius: "10px" },
        "*::-webkit-scrollbar-thumb:hover": { background: "#94A3B8" },
        "*::-webkit-scrollbar-thumb:active": { background: "#6D5DF6" },
        "*::-webkit-scrollbar-corner": { background: "transparent" },

        // Prevent horizontal overflow on every page globally
        "body": { overflowX: "hidden" },
      },
    },

    // ─── Paper: smaller radius on mobile ──────────────────────
    MuiPaper: {
      styleOverrides: {
        rounded: ({ theme }) => ({
          [theme.breakpoints.down("sm")]: {
            borderRadius: 8,
          },
        }),
      },
    },

    // ─── Dialog: fullscreen on mobile ─────────────────────────
    MuiDialog: {
      defaultProps: {
        fullScreen: false,
      },
      styleOverrides: {
        paper: ({ theme }) => ({
          [theme.breakpoints.down("sm")]: {
            margin: 12,
            maxHeight: "calc(100% - 24px)",
            width: "calc(100% - 24px)",
            borderRadius: 16,
          },
        }),
      },
    },

    // ─── TableContainer: horizontal scroll on mobile ───────────
    MuiTableContainer: {
      styleOverrides: {
        root: {
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
        },
      },
    },

    // ─── Table cells: compact padding on mobile ────────────────
    MuiTableCell: {
      styleOverrides: {
        root: ({ theme }) => ({
          [theme.breakpoints.down("sm")]: {
            padding: "8px 10px",
            fontSize: "0.8rem",
          },
        }),
      },
    },

    // ─── Button: full-width on xs if needed ───────────────────
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none", // global: no UPPERCASE buttons
          fontWeight: 600,
        },
      },
    },

    // ─── MenuItem: disabled items stay readable ────────────────
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

    // ─── Global Input Base & Text Fields ───────────────────────
    MuiInputBase: {
      styleOverrides: {
        input: {
          fontSize: 14,
          color: "#111827",
          "&::placeholder": {
            fontSize: "13px",
            color: "#9CA3AF",
            opacity: 1,
          },
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          backgroundColor: "#FFFFFF",
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#94A3B8",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#6D5DF6",
            borderWidth: "2px",
          },
        },
        notchedOutline: {
          borderColor: "#CBD5E1",
          borderWidth: "1px",
          transition: "border-color 0.2s ease",
        },
        input: {
          padding: "12px 14px",
          fontSize: "14px",
          color: "#1E293B",
        },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: "14px",
          fontWeight: 500,
          color: "#64748B",
          "&.Mui-focused": {
            color: "#6D5DF6",
            fontWeight: 600,
          },
        },
        outlined: {
          backgroundColor: "#FFFFFF",
          padding: "0 6px",
          borderRadius: "4px",
        },
      },
    },

    MuiFormHelperText: {
      styleOverrides: {
        root: {
          marginLeft: 0,
          marginTop: "4px",
          fontSize: "12px",
        },
      },
    },

    MuiSelect: {
      styleOverrides: {
        select: {
          display: "flex",
          alignItems: "center",
        },
      },
    },
  },
});