import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

function AuthLeftSection() {
  return (
    <Box sx={{ backgroundColor: "primary.lighter", display: "flex", alignItems: "center", justifyContent: "center", p: { xs: 3, sm: 5 } }}>
      <Box sx={{ textAlign: "center" }}>
        <Box
          sx={{
            width: { xs: 240, sm: 320 },
            height: { xs: 240, sm: 320 },
            backgroundColor: "action.hover",
            borderRadius: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            color: "text.secondary",
          }}
        >
          Illustration
        </Box>

        <Typography variant="h5" sx={{ mt: 4, fontWeight: 700, color: "text.primary" }}>
          Join Our HRMS Platform
        </Typography>

        <Typography variant="body1" sx={{ mt: 1.5, color: "text.secondary" }}>
          Manage employees, attendance, leave, payroll and more in one place.
        </Typography>
      </Box>
    </Box>
  );
}

export default AuthLeftSection;