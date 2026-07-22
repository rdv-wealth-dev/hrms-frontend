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
          scrollbarColor: "#CBD5E1 transparent",
          "&::-webkit-scrollbar": {
            width: "7px",
            height: "7px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
            borderRadius: "10px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#CBD5E1",
            borderRadius: "10px",
            transition: "background-color 0.2s ease-in-out",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "#94A3B8",
          },
          "&::-webkit-scrollbar-thumb:active": {
            background: "#6D5DF6",
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
