import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import PersonIcon from "@mui/icons-material/Person";

import type { EmployeeNode } from "../types";

type EmployeeCardProps = {
  employee: EmployeeNode;
};

function EmployeeCard({ employee }: EmployeeCardProps) {
  return (
    <Stack direction="row" spacing={2}>
      <Avatar
        sx={{
          width: 48,
          height: 48,
        }}
      >
        <PersonIcon />
      </Avatar>

      <Box sx={{ flex: 1 }}>
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 600,
            color: "primary.main",
          }}
        >
          {employee.designation}
        </Typography>

        <Typography
          sx={{
            fontSize: 20,
            fontWeight: 600,
            mt: 0.5,
          }}
        >
          {employee.name}
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            fontSize: 13,
            mt: 1,
          }}
        >
          Skills: {employee.skills}
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            mt: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              px: 1,
              py: 0.5,
              borderRadius: 1,
              bgcolor: "grey.100",
            }}
          >
            <GroupsOutlinedIcon sx={{ fontSize: 16 }} />

            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {employee.teamCount}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Stack>
  );
}

export default EmployeeCard;