import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

function AuthLogo() {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Box sx={{ width: 40, height: 40, borderRadius: "12px", backgroundColor: "#6D5DF6" }} />
      <Typography variant="h6" sx={{ fontWeight: 700, color: "#111827" }}>
        HRMS
      </Typography>
    </Box>
  );
}

export default AuthLogo;