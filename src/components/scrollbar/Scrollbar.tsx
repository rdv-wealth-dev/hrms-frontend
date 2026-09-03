import { forwardRef } from "react";
import Box, { type BoxProps } from "@mui/material/Box";

export interface ScrollbarProps extends BoxProps {
  fillContent?: boolean;
}

export const Scrollbar = forwardRef<HTMLDivElement, ScrollbarProps>(
  ({ children, fillContent, sx, ...other }, ref) => {
    return (
      <Box
        ref={ref}
        sx={{
          flexGrow: 1,
          height: 1,
          overflow: "auto",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "thin",
          scrollbarColor: "divider transparent",
          "&::-webkit-scrollbar": {
            width: "7px",
            height: "7px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
            borderRadius: "10px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "divider",
            borderRadius: "10px",
            transition: "background-color 0.2s ease-in-out",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "neutral.400",
          },
          "&::-webkit-scrollbar-thumb:active": {
            backgroundColor: "primary.main",
          },
          ...(fillContent && {
            "& .MuiBox-root": {
              minHeight: 1,
              display: "flex",
              flexDirection: "column",
            },
          }),
          ...sx,
        }}
        {...other}
      >
        {children}
      </Box>
    );
  }
);

Scrollbar.displayName = "Scrollbar";
export default Scrollbar;
