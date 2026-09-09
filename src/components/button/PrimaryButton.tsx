import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import type { ReactNode, MouseEventHandler } from "react";

type PrimaryButtonProps = {
  type?: "button" | "submit" | "reset";
  children: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

function PrimaryButton({
  type = "button",
  children,
  loading = false,
  disabled = false,
  onClick,
}: PrimaryButtonProps) {
  return (
    <Button
      type={type}
      fullWidth
      variant="contained"
      disabled={loading || disabled}
      onClick={onClick}
      sx={{
        height: { xs: "42px", sm: "46px" },
        borderRadius: "12px",
        bgcolor: "primary.main",
        color: "primary.contrastText",
        fontWeight: 600,
        textTransform: "none",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",

        "&:hover": {
          bgcolor: "primary.dark",
          opacity: 0.95,
          transform: loading ? "none" : "scale(1.01)",
        },

        "&:active": {
          transform: loading ? "none" : "scale(0.99)",
        },

        "&.Mui-disabled": {
          bgcolor: "primary.main",
          color: "primary.contrastText",
          opacity: 0.7,
        },
      }}
    >
      {loading ? (
        <CircularProgress size={22} color="inherit" />
      ) : (
        children
      )}
    </Button>
  );
}

export default PrimaryButton;