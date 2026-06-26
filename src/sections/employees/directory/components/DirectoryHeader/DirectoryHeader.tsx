import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import FullscreenOutlinedIcon from "@mui/icons-material/FullscreenOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";

function DirectoryHeader() {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 4 }}>
      {/* Left Section */}
      <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
        <AccountTreeOutlinedIcon
          color="primary"
          sx={{ fontSize: 34 }}
        />

        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
            }}
          >
            Employee Directory
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Explore the organizational structure and reporting hierarchy.
          </Typography>
        </Box>
      </Stack>

      {/* Right Section */}
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
        <TextField
          size="small"
          placeholder="Search employees..."
          sx={{
            width: 320,
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />

        <IconButton
          sx={{
            border: 1,
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <FilterAltOutlinedIcon />
        </IconButton>

        <IconButton
          sx={{
            border: 1,
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <FullscreenOutlinedIcon />
        </IconButton>

        <IconButton
          color="primary"
          sx={{
            border: 1,
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <FileDownloadOutlinedIcon />
        </IconButton>
      </Stack>
    </Box>
  );
}

export default DirectoryHeader;