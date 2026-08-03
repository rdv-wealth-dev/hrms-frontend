import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

interface AuthHeadingProps {
  title: string;
  subtitle?: string;
  titleSize?: any;
}

function AuthHeading({
  title,
  subtitle,
  titleSize,
}: AuthHeadingProps) {
  return (
    <Box sx={{ mb: { xs: 1, sm: 1.3 }, textAlign: "center" }}>
      <Typography
        variant="h3"
        sx={{
          fontWeight: 700,
          color: "#111827",
          fontSize: titleSize || { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </Typography>

      {subtitle && (
        <Typography
          sx={{
            mt: 0.6,
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