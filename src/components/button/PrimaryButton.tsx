import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import type { ReactNode, MouseEventHandler } from "react";

type PrimaryButtonProps = {
  type?: "button" | "submit" | "reset";
  children: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>; // ✅ added
};

function PrimaryButton({
  type = "button",
  children,
  loading = false,
  disabled = false,
  onClick, // ✅ added
}: PrimaryButtonProps) {
  return (
    <Button
      type={type}
      fullWidth
      variant="contained"
      disabled={loading || disabled}
      onClick={onClick} // ✅ added
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
          transform: loading ? "none" : "scale(1.01)",
        },

        "&:active": {
          transform: loading ? "none" : "scale(0.99)",
        },

        "&.Mui-disabled": {
          backgroundColor: "#6D5DF6",
          color: "#fff",
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