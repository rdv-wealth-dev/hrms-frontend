import Box from "@mui/material/Box";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Tooltip from "@mui/material/Tooltip";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import LeaderboardOutlinedIcon from "@mui/icons-material/LeaderboardOutlined";

export type ViewMode = "classic" | "people_hub";

interface ViewModeSwitcherProps {
  viewMode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewModeSwitcher({ viewMode, onChange }: ViewModeSwitcherProps) {
  const handleViewChange = (
    _event: React.MouseEvent<HTMLElement>,
    newMode: ViewMode | null
  ) => {
    if (newMode !== null) {
      onChange(newMode);
    }
  };

  return (
    <Box sx={{ display: "inline-flex", alignItems: "center" }}>
      <ToggleButtonGroup
        value={viewMode}
        exclusive
        onChange={handleViewChange}
        size="small"
        sx={{
          backgroundColor: "#F1F5F9",
          p: 0.5,
          borderRadius: 2.5,
          border: "1px solid #E2E8F0",
          "& .MuiToggleButton-root": {
            border: "none",
            borderRadius: 2,
            px: 1.5,
            py: 0.6,
            color: "#64748B",
            transition: "all 0.2s ease",
            "&.Mui-selected": {
              backgroundColor: "#6D5DF6",
              color: "#FFFFFF",
              boxShadow: "0 2px 8px rgba(109, 93, 246, 0.3)",
              "&:hover": {
                backgroundColor: "#5B4BEA",
              },
            },
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.04)",
            },
          },
        }}
      >
        <Tooltip title="Design 2: People Hub View" placement="top">
          <ToggleButton value="people_hub" aria-label="People Hub View">
            <LeaderboardOutlinedIcon sx={{ fontSize: 18 }} />
          </ToggleButton>
        </Tooltip>

        <Tooltip title="Design 1: Classic Table View" placement="top">
          <ToggleButton value="classic" aria-label="Classic View">
            <FormatListBulletedIcon sx={{ fontSize: 18 }} />
          </ToggleButton>
        </Tooltip>
      </ToggleButtonGroup>
    </Box>
  );
}

export default ViewModeSwitcher;
