import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

type Category = {
  id: string;
  label: string;
};

type Props = {
  categories: Category[];
  activeId: string;
  onSelect: (id: string) => void;
};

function SettingsCategoryList({ categories, activeId, onSelect }: Props) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 0.5,
        mb: 2,
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
              backgroundColor: isActive ? "primary.lighter" : "transparent",
              "&:hover": {
                backgroundColor: isActive ? "primary.lighter" : "action.hover",
              },
            }}
          >
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "primary.main" : "text.secondary",
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
