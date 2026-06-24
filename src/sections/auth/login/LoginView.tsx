import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";


import AuthLayout from "../../../layouts/auth/AuthLayout";
import AuthHeading from "../../../components/auth/AuthHeading";
import TextInput from "../../../components/input/TextInput";
import PrimaryButton from "../../../components/button/PrimaryButton";
import AuthDivider from "../../../components/auth/AuthDivider";
import GoogleAuthButton from "../../../components/auth/GoogleAuthButton";
import AuthFooter from "../../../components/auth/AuthFooter";
import { useNavigate } from "react-router-dom";
import { paths } from "../../../routes/paths";

function LoginView() {

  const navigate = useNavigate();
  return (
    <AuthLayout>
      <Box
        sx={{
          width: "100%",
          maxWidth: "32rem",
        }}
      >
        <AuthHeading title="Sign In" subtitle="Welcome back!" />
        <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 1.5, }}>
          <TextInput label="Company Email" placeholder="Enter company Email" variant="underlined" />
          <TextInput label="Password" placeholder="Enter Password" type="password" variant="underlined" />
          <Typography sx={{ alignSelf: "flex-end", fontSize: "14px", fontWeight: 500, color: "#4F46E5", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}>
            Forgot Password?
          </Typography>

          <PrimaryButton type="submit">
            Sign In
          </PrimaryButton>
          <AuthDivider />
          <GoogleAuthButton />
          <AuthFooter
  text="Don't have an account?"
  linkText="Sign Up"
  onClick={() => navigate(paths.auth.signup)}
/>
        </Box>
      </Box>
    </AuthLayout>
  );
}

export default LoginView;