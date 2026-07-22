import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { SettingsSubItem } from "../../sections/settings/settings-config";

type Props = {
  items: SettingsSubItem[];
  activeId: string;
  onSelect: (id: string) => void;
};

// Middle column of the Settings 3-column layout.
// Renders sub-items for the selected category (Departments, Designations, etc.)
// Reusable — knows nothing about what the sub-items render.

function SettingsSubList({ items, activeId, onSelect }: Props) {
  return (
    <Box
      sx={{
        width: 180,
        flexShrink: 0,
        backgroundColor: "#fff",
        borderRadius: 3,
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        py: 1,
        height: "fit-content",
      }}
    >
      {items.map((item) => {
        const isActive = item.id === activeId;
        return (
          <Box
            key={item.id}
            onClick={() => onSelect(item.id)}
            sx={{
              px: 2,
              py: 1,
              cursor: "pointer",
              borderLeft: isActive ? "3px solid #6D5DF6" : "3px solid transparent",
              "&:hover": {
                backgroundColor: "#F9FAFB",
              },
            }}
          >
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "#6D5DF6" : "#6B7280",
              }}
            >
              {item.label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}

export default SettingsSubList;
