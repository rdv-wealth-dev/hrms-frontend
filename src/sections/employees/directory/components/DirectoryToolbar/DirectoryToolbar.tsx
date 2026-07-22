import {
  Button,
  ButtonGroup,
  Stack,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import FitScreenOutlinedIcon from "@mui/icons-material/FitScreenOutlined";

function DirectoryToolbar() {
  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
      <ButtonGroup
        variant="outlined"
        sx={{
          "& .MuiButton-root": {
            minWidth: 44,
            height: 44,
          },
        }}
      >
        <Button>
          <RemoveIcon fontSize="small" />
        </Button>

        <Button
          disableRipple
          sx={{
            minWidth: 72,
            fontWeight: 600,
          }}
        >
          100%
        </Button>

        <Button>
          <AddIcon fontSize="small" />
        </Button>
      </ButtonGroup>

      <Button
        variant="outlined"
        sx={{
          minWidth: 44,
          width: 44,
          height: 44,
        }}
      >
        <FitScreenOutlinedIcon fontSize="small" />
      </Button>
    </Stack>
  );
}

export default DirectoryToolbar;