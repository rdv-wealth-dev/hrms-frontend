import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

interface AuthHeadingProps {
  title: string;
  subtitle?: string;
}

function AuthHeading({
  title,
  subtitle,
}: AuthHeadingProps) {
  return (
    <Box sx={{ mb: { xs: 1.5, sm: 2 }, textAlign: "center" }}>
      <Typography
        variant="h3"
        sx={{
          fontWeight: 700,
          color: "#111827",
          fontSize: { xs: "1.6rem", sm: "1.9rem", md: "2.2rem" },
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </Typography>

      {subtitle && (
        <Typography
          sx={{
            mt: 1,
            fontSize: { xs: "13px", sm: "14px" },
            color: "#6B7280",
          }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}

export default AuthHeading;