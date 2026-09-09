import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

type SubItem = {
  id: string;
  label: string;
};

type Props = {
  items: SubItem[];
  activeId: string;
  onSelect: (id: string) => void;
};

function SettingsSubList({ items, activeId, onSelect }: Props) {
  return (
    <Box
      sx={{
        width: 180,
        flexShrink: 0,
        backgroundColor: "background.paper",
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
              borderLeft: "3px solid",
              borderLeftColor: isActive ? "primary.main" : "transparent",
              "&:hover": {
                backgroundColor: "action.hover",
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
              {item.label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}

export default SettingsSubList;
