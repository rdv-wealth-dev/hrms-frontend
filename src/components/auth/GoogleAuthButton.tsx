import Button from "@mui/material/Button";
import type { MouseEventHandler } from "react";

interface GoogleAuthButtonProps {
  text?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

function GoogleAuthButton({
  text = "Continue with Google",
  onClick,
}: GoogleAuthButtonProps) {
  return (
    <Button type="button" onClick={onClick} fullWidth startIcon={<img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{width: 20, height: 20,}}/>} sx={{height: "44px", borderRadius: "12px", border: "1px solid #D1D5DB", backgroundColor: "#F9FAFB", color: "#374151",fontSize: "14px", fontWeight: 500,textTransform: "none","&:hover": {backgroundColor: "#F9FAFB", border: "1px solid #D1D5DB", boxShadow: "0 1px 3px rgba(0,0,0,0.1)",},}}>
      {text}
    </Button>
  );
}

export default GoogleAuthButton;