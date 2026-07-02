import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";

function UnauthorizedScreen() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        alignItems: "center",
        bgcolor: "#fff",
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        height: "100vh",
        justifyContent: "center",
        left: 0,
        position: "fixed",
        textAlign: "center",
        top: 0,
        width: "100vw",
        zIndex: 9999,
        px: 2,
      }}
    >
      <Typography
        sx={{
          color: "#e5e7eb",
          fontSize: { xs: 80, md: 120 },
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: "-4px",
        }}
      >
        403
      </Typography>

      <Typography sx={{ color: "#111827", fontSize: 22, fontWeight: 700, mt: 1 }}>
        Forbidden
      </Typography>

      <Typography sx={{ color: "#6b7280", fontSize: 14, maxWidth: 380 }}>
        You don&apos;t have permission to access this page. Please contact
        your administrator if you think this is a mistake.
      </Typography>

      <Button
        variant="contained"
        onClick={() => navigate(-1)}
        sx={{
          borderRadius: "8px",
          mt: 2,
          px: 3,
          textTransform: "none",
          fontWeight: 600,
          backgroundColor: "#6D5DF6",
          "&:hover": { backgroundColor: "#5B4BEA" },
        }}
      >
        Go Back
      </Button>
    </Box>
  );
}

export default UnauthorizedScreen;