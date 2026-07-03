import Box from "@mui/material/Box";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

// Right column of the Settings 3-column layout.
// A white rounded card shell — the actual content (DepartmentContent,
// DesignationContent, etc.) renders inside via children.

function SettingsContentPanel({ children }: Props) {
  return (
    <Box
      sx={{
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 3,
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        overflow: "auto",
        minHeight: 400,
      }}
    >
      {children}
    </Box>
  );
}

export default SettingsContentPanel;
