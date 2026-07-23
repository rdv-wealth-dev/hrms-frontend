import Box from "@mui/material/Box";
import type { ReactNode } from "react";
import type { SxProps, Theme } from "@mui/material/styles";

interface PageWrapperProps {
  children: ReactNode;
  /** Extra sx overrides if a page needs one-off adjustments */
  sx?: SxProps<Theme>;
  /** Set true to remove horizontal padding (e.g. full-bleed tables) */
  noPadding?: boolean;
  /** Set true to remove max-width cap (e.g. calendar, full-width dashboards) */
  fluid?: boolean;
}

/**
 * PageWrapper — global responsive page container.
 *
 * Wraps every dashboard page with:
 * - Consistent horizontal + vertical padding across xs / sm / md / lg
 * - A sensible max-width so content doesn't stretch on ultra-wide screens
 * - Mobile top offset so content clears the floating hamburger button
 * - `overflowX: hidden` guard to prevent horizontal scroll on narrow viewports
 *
 * Usage:
 *   <DashboardLayout>
 *     <PageWrapper>
 *       <YourPageContent />
 *     </PageWrapper>
 *   </DashboardLayout>
 */
export default function PageWrapper({ children, sx, noPadding = false, fluid = false }: PageWrapperProps) {
  return (
    <Box
      sx={{
        // Mobile: add top padding so content clears the floating ☰ button
        pt: { xs: 7, md: 0 },

        // Responsive horizontal + vertical padding
        ...(noPadding
          ? {}
          : {
              px: { xs: 2, sm: 3, md: 3, lg: 4 },
              py: { xs: 2, sm: 2.5, md: 3 },
            }),

        // Max-width cap — prevents content becoming unreadable on 4K+ screens
        ...(fluid
          ? {}
          : {
              maxWidth: { xl: 1440 },
              mx: "auto",
            }),

        // Safety: never let page content cause horizontal scroll
        width: "100%",
        boxSizing: "border-box",
        overflowX: "hidden",

        // Caller overrides
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
