import Box from "@mui/material/Box";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Tooltip from "@mui/material/Tooltip";
import TableRowsOutlinedIcon from "@mui/icons-material/TableRowsOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";

export type ViewMode = "classic" | "people_hub" | "directory";

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
        value={viewMode === "classic" ? "people_hub" : viewMode}
        exclusive
        onChange={handleViewChange}
        size="small"
        sx={{
          backgroundColor: "#F3F4F6",
          p: "4px",
          borderRadius: "20px",
          border: "1px solid #E5E7EB",
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03)",
          "& .MuiToggleButtonGroup-grouped": {
            border: "none",
            borderRadius: "12px !important",
          },
          "& .MuiToggleButton-root": {
            border: "none",
            borderRadius: "12px",
            px: 1.6,
            py: 0.6,
            minWidth: 42,
            height: 34,
            color: "#64748B",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            "&.Mui-selected": {
              backgroundColor: "#6D5DF6",
              color: "#FFFFFF",
              boxShadow: "0 2px 6px rgba(109, 93, 246, 0.35)",
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
        <Tooltip title="Table View" placement="top">
          <ToggleButton value="people_hub" aria-label="Table View">
            <TableRowsOutlinedIcon sx={{ fontSize: 20 }} />
          </ToggleButton>
        </Tooltip>

        <Tooltip title="Employee Directory View" placement="top">
          <ToggleButton value="directory" aria-label="Employee Directory View">
            <GridViewOutlinedIcon sx={{ fontSize: 20 }} />
          </ToggleButton>
        </Tooltip>
      </ToggleButtonGroup>
    </Box>
  );
}

export default ViewModeSwitcher;
