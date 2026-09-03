import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import type { SxProps, Theme } from "@mui/material/styles";
import { typographyTokens } from "../../theme/tokens/typography.tokens";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  iconBg?: string;
  action?: ReactNode;
  viewSwitcher?: ReactNode;
  extra?: ReactNode;
  sx?: SxProps<Theme>;
}

export function PageHeader({
  title,
  subtitle,
  icon,
  iconBg = "primary.lighter",
  action,
  viewSwitcher,
  extra,
  sx,
}: PageHeaderProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: { xs: "flex-start", sm: "center" },
        justifyContent: "space-between",
        flexDirection: { xs: "column", sm: "row" },
        gap: 2,
        mb: 3,
        ...sx,
      }}
    >
      {/* Title & Subtitle Stack */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        {icon && (
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "12px",
              backgroundColor: iconBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        )}
        <Box>
          <Typography component="h1" sx={typographyTokens.pageTitle}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" sx={{ ...typographyTokens.pageSubtitle, mt: 0.25 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Right Side Actions / Controls */}
      <Stack
        direction="row"
        spacing={1.5}
        sx={{
          alignItems: "center",
          flexWrap: "wrap",
          width: { xs: "100%", sm: "auto" },
          justifyContent: { xs: "flex-start", sm: "flex-end" },
        }}
      >
        {viewSwitcher}
        {extra}
        {action}
      </Stack>
    </Box>
  );
}

export default PageHeader;
