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

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "16px",
          border: "1px solid #E2E8F0",
          backgroundColor: "#FFFFFF",
          boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
        },
      },
    },

    // ─── Backdrop Blur (Dialog & Modal Overlays) ────────────
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backdropFilter: "blur(6px)",
          backgroundColor: "rgba(15, 23, 42, 0.4)",
          transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important",
        },
      },
    },

    // ─── Popover & Menu Dropdowns (Transparent Non-Blur Backdrop) ───
    MuiPopover: {
      styleOverrides: {
        root: {
          "& .MuiBackdrop-root": {
            backdropFilter: "none !important",
            backgroundColor: "transparent !important",
          },
        },
      },
    },

    MuiMenu: {
      styleOverrides: {
        root: {
          "& .MuiBackdrop-root": {
            backdropFilter: "none !important",
            backgroundColor: "transparent !important",
          },
        },
        paper: ({ theme }) => ({
          maxHeight: "184px !important",
          maxWidth: "calc(100vw - 32px)",
          borderRadius: "12px",
          border: "1px solid #E2E8F0",
          boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.05)",
          marginTop: "4px",
          overflowY: "auto !important",
          scrollbarWidth: "thin",
          scrollbarColor: "#CBD5E1 transparent",
          "&::-webkit-scrollbar": { width: "5px" },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          "&::-webkit-scrollbar-thumb": { background: "#CBD5E1", borderRadius: "10px" },
          "&::-webkit-scrollbar-thumb:hover": { background: "#94A3B8" },
          [theme.breakpoints.down("sm")]: {
            maxHeight: "184px !important",
            borderRadius: "10px",
          },
          "& .MuiMenuItem-root": {
            minHeight: "44px !important",
            fontSize: "13.5px",
            whiteSpace: "normal",
            wordBreak: "break-word",
            [theme.breakpoints.up("sm")]: {
              minHeight: "40px !important",
              height: "40px",
              fontSize: "14px",
              whiteSpace: "nowrap",
            },
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
          borderRadius: "10px",
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
          fontSize: "14px",
          color: "#0F172A",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#CBD5E1",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#6D5DF6",
            borderWidth: "2px",
          },
          "&.Mui-focused": {
            boxShadow: "0 0 0 3px rgba(109, 93, 246, 0.12)",
          },
        },
        notchedOutline: {
          borderColor: "#E2E8F0",
          borderWidth: "1.5px",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        },
        input: {
          padding: "12px 14px",
          fontSize: "14px",
          color: "#0F172A",
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
          "&.MuiInputLabel-shrink": {
            fontSize: "12.5px",
            fontWeight: 600,
          },
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