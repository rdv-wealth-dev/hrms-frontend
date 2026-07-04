import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import FormatListBulletedOutlinedIcon from "@mui/icons-material/FormatListBulletedOutlined";

import DashboardLayout from "../../layouts/dashboard/DashboardLayout";
import { paths } from "../../routes/paths";

function DashboardView() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#111827" }}>
          Welcome to Dashboard 🎉
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 4 }}>
          Use the sidebar to navigate to Departments.
        </Typography>

        {/* Quick Action Cards */}
        <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
          {/* Card 1: Add Employee */}
          <Box
            sx={{
              p: 3,
              borderRadius: 3,
              backgroundColor: "#fff",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              maxWidth: 320,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  backgroundColor: "rgba(109, 93, 246, 0.1)",
                  color: "#6D5DF6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <PersonAddOutlinedIcon />
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#111827" }}>
                Add Employee
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Add a new employee to your organization and send activation email.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate(paths.employees.create)}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                backgroundColor: "#6D5DF6",
                "&:hover": { backgroundColor: "#5B4BEA" },
                mt: 1,
              }}
            >
              Create Employee
            </Button>
          </Box>

          {/* Card 2: All Employees */}
          <Box
            sx={{
              p: 3,
              borderRadius: 3,
              backgroundColor: "#fff",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              maxWidth: 320,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  backgroundColor: "rgba(109, 93, 246, 0.1)",
                  color: "#6D5DF6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FormatListBulletedOutlinedIcon />
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#111827" }}>
                All Employees
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              View, search, and manage all employee records in your organization.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate(paths.employees.list)}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                backgroundColor: "#6D5DF6",
                "&:hover": { backgroundColor: "#5B4BEA" },
                mt: 1,
              }}
            >
              View Employees
            </Button>
          </Box>
        </Box>
      </Box>
    </DashboardLayout>
  );
}

export default DashboardView;