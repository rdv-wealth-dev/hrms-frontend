import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

function DashboardView() {
  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Typography variant="h3">
        Welcome to Dashboard 🎉
      </Typography>
    </Box>
  );
}

export default DashboardView;