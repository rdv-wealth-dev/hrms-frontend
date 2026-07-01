import DashboardLayout from "../../layouts/dashboard/DashboardLayout";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

function DashboardView() {
  return (
    <DashboardLayout>
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#111827" }}>
          Welcome to Dashboard 🎉
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Use the sidebar to navigate to Departments.
        </Typography>
      </Box>
    </DashboardLayout>
  );
}

export default DashboardView;