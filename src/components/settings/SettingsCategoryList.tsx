import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { SettingsCategory } from "../../sections/settings/settings-config";

type Props = {
  categories: SettingsCategory[];
  activeId: string;
  onSelect: (id: string) => void;
};

// Left column of the Settings 3-column layout.
// Renders the top-level settings categories (Master Data, Company Settings, etc.)
// Reusable — knows nothing about what the categories contain.

function SettingsCategoryList({ categories, activeId, onSelect }: Props) {
  return (
    <Box
      sx={{
        width: 200,
        flexShrink: 0,
        backgroundColor: "#fff",
        borderRadius: 3,
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        py: 1,
        height: "fit-content",
      }}
    >
      {categories.map((cat) => {
        const isActive = cat.id === activeId;
        return (
          <Box
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            sx={{
              px: 2,
              py: 1.25,
              cursor: "pointer",
              borderRadius: 2,
              mx: 1,
              backgroundColor: isActive ? "#EEF2FF" : "transparent",
              "&:hover": {
                backgroundColor: isActive ? "#EEF2FF" : "#F9FAFB",
              },
            }}
          >
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "#6D5DF6" : "#374151",
              }}
            >
              {cat.label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}

export default SettingsCategoryList;
