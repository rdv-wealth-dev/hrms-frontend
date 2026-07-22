import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";

function EmployeeNode() {
  return (
    <Card
      elevation={2}
      sx={{
        width: 280,
        borderRadius: 2,
        p: 2,
      }}
    >
      <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start" }}>
        <Avatar
          sx={{
            width: 48,
            height: 48,
          }}
        />

       <Box sx={{ flex: 1 }}>
          <Typography
            variant="body2"
            color="primary"
            sx={{
              fontWeight: 700,
            }}
          >
            CEO
          </Typography>

          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
            }}
          >
            Santiago Garcia
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            Skills: Analytic Intelligence, Leadership...
          </Typography>

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              mt: 1.5,
            }}
          >
            <Chip
              size="small"
              icon={<GroupsOutlinedIcon />}
              label="6"
            />
          </Box>
        </Box>
      </Stack>
    </Card>
  );
}

export default EmployeeNode;