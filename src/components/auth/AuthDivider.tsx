import Divider from "@mui/material/Divider";

interface AuthDividerProps {
  text?: string;
}

const AuthDivider = ({
  text = "or continue with",
}: AuthDividerProps) => {
  return (
    <Divider
      sx={{
        my: 3,
        color: "#6B7280",
        fontSize: "14px",
      }}
    >
      {text}
    </Divider>
  );
};

export default AuthDivider;