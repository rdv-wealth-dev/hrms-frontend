import Button from "@mui/material/Button";
import type { ReactNode } from "react";

type PrimaryButtonProps = {
  type?: "button" | "submit" | "reset";
  children: ReactNode;
};

function PrimaryButton({
  type = "button",
  children,
}: PrimaryButtonProps) {
  return (
    <Button
      type={type}
      fullWidth
      variant="contained"
      sx={{
        height: "48px",
        borderRadius: "12px",
        backgroundColor: "#6D5DF6",
        fontWeight: 600,
        textTransform: "none",
        boxShadow:
          "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",

        "&:hover": {
          backgroundColor: "#6D5DF6",
          opacity: 0.95,
          transform: "scale(1.01)",
        },

        "&:active": {
          transform: "scale(0.99)",
        },
      }}
    >
      {children}
    </Button>
  );
}

export default PrimaryButton;