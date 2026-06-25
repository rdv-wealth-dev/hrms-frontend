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
    <Box sx={{mb: 4,textAlign: "center",}}>
      <Typography variant="h3" sx={{fontWeight: 600, color: "#111827", fontSize: {xs: "2rem", md: "2.5rem",},}}>
        {title}
      </Typography>

      {subtitle && (<Typography sx={{mt: 1, fontSize: "14px", color: "#6B7280",}}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}

export default AuthHeading;