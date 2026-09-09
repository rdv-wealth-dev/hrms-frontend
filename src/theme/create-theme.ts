// src/theme/create-theme.ts
import { createTheme, alpha } from "@mui/material/styles";
import { themeConfig } from "./theme-config";
import { typographyTokens } from "./tokens/typography.tokens";

export { typographyTokens };

export function createAppTheme(
  mode: "light" | "dark" = "light",
  customPrimaryColor?: string
) {
  const isDark = mode === "dark";
  const basePalette = isDark ? themeConfig.darkPalette : themeConfig.palette;

  const primary = customPrimaryColor
    ? {
        main: customPrimaryColor,
        light: alpha(customPrimaryColor, 0.8),
        dark: customPrimaryColor,
        lighter: alpha(customPrimaryColor, 0.08),
        darker: customPrimaryColor,
        contrastText: "#FFFFFF",
      }
    : basePalette.primary;

  const baseTheme = createTheme({
    palette: {
      mode,
      primary,
      divider: basePalette.divider,
      background: {
        default: basePalette.background.default,
        paper: basePalette.background.paper,
      },
      text: {
        primary: basePalette.text.primary,
        secondary: basePalette.text.secondary,
      },
      neutral: basePalette.neutral,
    },

    typography: {
      fontFamily: typographyTokens.fontFamily,

      h4: {
        fontSize: "clamp(1.2rem, 2vw, 1.5rem)",
        fontWeight: 700,
        color: basePalette.text.primary,
        letterSpacing: "-0.01em",
      },
      h5: {
        fontSize: "clamp(1.05rem, 1.8vw, 1.25rem)",
        fontWeight: 700,
        color: basePalette.text.primary,
        letterSpacing: "-0.01em",
      },
      h6: {
        fontSize: "clamp(0.95rem, 1.5vw, 1.1rem)",
        fontWeight: 600,
        color: basePalette.text.primary,
      },
      subtitle1: {
        fontSize: "0.9375rem",
        fontWeight: 600,
        color: basePalette.text.primary,
      },
      subtitle2: {
        fontSize: "0.875rem",
        fontWeight: 600,
        color: basePalette.text.primary,
      },
      body1: {
        fontSize: "0.875rem",
        fontWeight: 400,
        lineHeight: 1.5,
        color: basePalette.text.primary,
      },
      body2: {
        fontSize: "0.8125rem",
        fontWeight: 400,
        lineHeight: 1.4,
        color: basePalette.text.secondary,
      },
      caption: {
        fontSize: "0.75rem",
        fontWeight: 400,
        color: basePalette.text.secondary,
      },
      button: {
        textTransform: "none",
        fontWeight: 600,
        fontSize: "0.875rem",
      },
    },
  });

  return createTheme(baseTheme, {
    components: {
      // ─── Scrollbar ────────────────────────────────────────────
      MuiCssBaseline: {
        styleOverrides: {
          "*": {
            scrollbarWidth: "thin",
            scrollbarColor: `${baseTheme.palette.neutral?.[300] ?? "#CBD5E1"} transparent`,
          },
          "*::-webkit-scrollbar": { width: "7px", height: "7px" },
          "*::-webkit-scrollbar-track": { background: "transparent", borderRadius: "10px" },
          "*::-webkit-scrollbar-thumb": {
            background: baseTheme.palette.neutral?.[300] ?? "#CBD5E1",
            borderRadius: "10px",
          },
          "*::-webkit-scrollbar-thumb:hover": {
            background: baseTheme.palette.neutral?.[400] ?? "#94A3B8",
          },
          "*::-webkit-scrollbar-thumb:active": {
            background: baseTheme.palette.primary.main,
          },
          "*::-webkit-scrollbar-corner": { background: "transparent" },

          body: {
            overflowX: "hidden",
            fontFamily: typographyTokens.fontFamily,
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
            backgroundColor: baseTheme.palette.background.default,
            color: baseTheme.palette.text.primary,
          },
        },
      },

      MuiPaper: {
        styleOverrides: {
          rounded: {
            [baseTheme.breakpoints.down("sm")]: {
              borderRadius: 8,
            },
          },
        },
      },

      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: "16px",
            border: `1px solid ${baseTheme.palette.divider}`,
            backgroundColor: baseTheme.palette.background.paper,
            boxShadow: isDark ? "0 1px 3px rgba(0,0,0,0.3)" : "0 1px 3px rgba(0,0,0,0.02)",
          },
        },
      },

      MuiCardHeader: {
        styleOverrides: {
          title: {
            fontSize: "0.9375rem",
            fontWeight: 600,
            color: baseTheme.palette.text.primary,
          },
          subheader: {
            fontSize: "0.8125rem",
            color: baseTheme.palette.text.secondary,
          },
        },
      },

      // ─── Backdrop Blur (Dialog & Modal Overlays) ────────────
      MuiBackdrop: {
        styleOverrides: {
          root: {
            backdropFilter: "blur(6px)",
            backgroundColor: isDark ? "rgba(0, 0, 0, 0.6)" : "rgba(15, 23, 42, 0.4)",
            transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important",
          },
        },
      },

      // ─── Popover & Menu Dropdowns ────────────────────────────
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
          paper: {
            maxHeight: "184px !important",
            maxWidth: "calc(100vw - 32px)",
            borderRadius: "12px",
            border: `1px solid ${baseTheme.palette.divider}`,
            backgroundColor: baseTheme.palette.background.paper,
            boxShadow: isDark
              ? "0 10px 25px -5px rgba(0, 0, 0, 0.5)"
              : "0 10px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.05)",
            marginTop: "4px",
            overflowY: "auto !important" as any,
            scrollbarWidth: "thin",
            scrollbarColor: `${baseTheme.palette.neutral?.[300] ?? "#CBD5E1"} transparent`,
            "&::-webkit-scrollbar": { width: "5px" },
            "&::-webkit-scrollbar-track": { background: "transparent" },
            "&::-webkit-scrollbar-thumb": {
              background: baseTheme.palette.neutral?.[300] ?? "#CBD5E1",
              borderRadius: "10px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              background: baseTheme.palette.neutral?.[400] ?? "#94A3B8",
            },
            [baseTheme.breakpoints.down("sm")]: {
              maxHeight: "184px !important",
              borderRadius: "10px",
            },
            "& .MuiMenuItem-root": {
              minHeight: "44px !important",
              fontSize: "13.5px",
              whiteSpace: "normal",
              wordBreak: "break-word",
              color: baseTheme.palette.text.primary,
              [baseTheme.breakpoints.up("sm")]: {
                minHeight: "40px !important",
                height: "40px",
                fontSize: "14px",
                whiteSpace: "nowrap",
              },
            },
          },
        },
      },

      MuiDialog: {
        defaultProps: {
          fullScreen: false,
        },
        styleOverrides: {
          paper: {
            backgroundColor: baseTheme.palette.background.paper,
            [baseTheme.breakpoints.down("sm")]: {
              margin: 12,
              maxHeight: "calc(100% - 24px)",
              width: "calc(100% - 24px)",
              borderRadius: 16,
            },
          },
        },
      },

      MuiDialogTitle: {
        styleOverrides: {
          root: {
            fontSize: "1.125rem",
            fontWeight: 700,
            color: baseTheme.palette.text.primary,
            lineHeight: 1.25,
          },
        },
      },

      MuiTableContainer: {
        styleOverrides: {
          root: {
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
          },
        },
      },

      MuiTableCell: {
        styleOverrides: {
          root: {
            fontFamily: typographyTokens.fontFamily,
            borderBottom: `1px solid ${baseTheme.palette.divider}`,
            color: baseTheme.palette.text.primary,
            [baseTheme.breakpoints.down("sm")]: {
              padding: "8px 10px",
              fontSize: "0.8rem",
            },
          },
          head: {
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            color: baseTheme.palette.text.secondary,
            backgroundColor: isDark
              ? baseTheme.palette.background.default
              : (baseTheme.palette.neutral?.[50] ?? "#F8FAFC"),
          },
          body: {
            fontSize: "0.84375rem",
            color: baseTheme.palette.text.primary,
          },
        },
      },

      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 600,
            borderRadius: "10px",
            fontFamily: typographyTokens.fontFamily,
          },
          containedPrimary: {
            backgroundColor: baseTheme.palette.primary.main,
            "&:hover": {
              backgroundColor: baseTheme.palette.primary.dark,
            },
          },
        },
      },

      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: baseTheme.palette.divider,
          },
        },
      },

      MuiMenuItem: {
        styleOverrides: {
          root: {
            fontFamily: typographyTokens.fontFamily,
            "&.Mui-disabled": {
              opacity: 1,
              color: baseTheme.palette.text.secondary,
              fontWeight: 600,
            },
          },
        },
      },

      MuiInputBase: {
        styleOverrides: {
          root: {
            fontFamily: typographyTokens.fontFamily,
          },
          input: {
            fontSize: 14,
            color: baseTheme.palette.text.primary,
            fontFamily: typographyTokens.fontFamily,
            "&::placeholder": {
              fontSize: "13px",
              color: baseTheme.palette.text.secondary,
              opacity: 1,
            },
          },
        },
      },

      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: "12px",
            backgroundColor: baseTheme.palette.background.paper,
            fontSize: "14px",
            color: baseTheme.palette.text.primary,
            fontFamily: typographyTokens.fontFamily,
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: baseTheme.palette.neutral?.[300] ?? "#CBD5E1",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: baseTheme.palette.primary.main,
              borderWidth: "2px",
            },
            "&.Mui-focused": {
              boxShadow: `0 0 0 3px ${alpha(baseTheme.palette.primary.main, 0.12)}`,
            },
          },
          notchedOutline: {
            borderColor: baseTheme.palette.divider,
            borderWidth: "1.5px",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          },
          input: {
            padding: "12px 14px",
            fontSize: "14px",
            color: baseTheme.palette.text.primary,
          },
        },
      },

      MuiInputLabel: {
        styleOverrides: {
          root: {
            fontFamily: typographyTokens.fontFamily,
            fontSize: "14px",
            fontWeight: 500,
            color: baseTheme.palette.text.secondary,
            "&.Mui-focused": {
              color: baseTheme.palette.primary.main,
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
            fontFamily: typographyTokens.fontFamily,
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
            fontFamily: typographyTokens.fontFamily,
          },
        },
      },
    },
  });
}

export const theme = createAppTheme("light");