import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import type { MouseEventHandler } from "react";

interface AuthFooterProps {
  text: string;
  linkText: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

function AuthFooter({
  text,
  linkText,
  onClick,
}: AuthFooterProps) {
  return (
    <Typography
      sx={{
        mt: 3,
        textAlign: "center",
        fontSize: "14px",
        color: "#4B5563",
      }}
    >
      {text}{" "}

      <Button
        variant="text"
        onClick={onClick}
        sx={{
          minWidth: "auto",
          p: 0,
          fontSize: "14px",
          fontWeight: 500,
          textTransform: "none",
          color: "#4F46E5",
          verticalAlign: "baseline",

          "&:hover": {
            backgroundColor: "transparent",
            textDecoration: "underline",
            color: "#4338CA",
          },
        }}
      >
        {linkText}
      </Button>
    </Typography>
  );
}

export default AuthFooter;