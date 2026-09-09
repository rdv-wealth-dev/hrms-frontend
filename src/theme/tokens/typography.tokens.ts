// src/theme/tokens/typography.tokens.ts

export const typographyTokens = {
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',

  // ── Page & View Headers ────────────────────────────────────
  pageTitle: {
    fontSize: { xs: "1.2rem", sm: "1.375rem" }, // 22px
    fontWeight: 700,
    lineHeight: 1.25,
    color: "text.primary",
    letterSpacing: "-0.01em",
  },
  pageSubtitle: {
    fontSize: "0.84375rem", // 13.5px
    fontWeight: 400,
    lineHeight: 1.4,
    color: "text.secondary",
  },

  // ── Section & Modal Headers ────────────────────────────────
  sectionTitle: {
    fontSize: "0.9375rem", // 15px
    fontWeight: 600,
    lineHeight: 1.35,
    color: "text.primary",
  },
  dialogTitle: {
    fontSize: { xs: "1rem", sm: "1.125rem" }, // 18px
    fontWeight: 700,
    color: "text.primary",
    lineHeight: 1.25,
  },

  // ── Metric & KPI Stats ─────────────────────────────────────
  kpiValue: {
    fontSize: { xs: "1.5rem", sm: "1.75rem" }, // 28px
    fontWeight: 700,
    lineHeight: 1.1,
    color: "text.primary",
  },
  kpiLabel: {
    fontSize: "0.6875rem", // 11px
    fontWeight: 700,
    letterSpacing: "0.5px",
    textTransform: "uppercase" as const,
    color: "text.secondary",
  },

  // ── Tables & Grids ─────────────────────────────────────────
  tableHeader: {
    fontSize: "0.75rem", // 12px
    fontWeight: 700,
    letterSpacing: "0.5px",
    textTransform: "uppercase" as const,
    color: "text.secondary",
  },
  tableCell: {
    fontSize: "0.84375rem", // 13.5px
    fontWeight: 400,
    color: "text.primary",
  },
  tableCellPrimary: {
    fontSize: "0.84375rem", // 13.5px
    fontWeight: 600,
    color: "text.primary",
  },

  // ── Body & Captions ────────────────────────────────────────
  body: {
    fontSize: "0.875rem", // 14px
    fontWeight: 400,
    lineHeight: 1.5,
    color: "text.primary",
  },
  bodyMedium: {
    fontSize: "0.875rem", // 14px
    fontWeight: 500,
    lineHeight: 1.5,
    color: "text.primary",
  },
  caption: {
    fontSize: "0.75rem", // 12px
    fontWeight: 400,
    color: "text.secondary",
  },
  badge: {
    fontSize: "0.6875rem", // 11px
    fontWeight: 600,
  },
};

export type TypographyTokens = typeof typographyTokens;
