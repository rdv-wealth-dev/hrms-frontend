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
      <Box sx={{ width: "100%", maxWidth: "32rem", }}>
        <AuthHeading title="Sign In" subtitle="Welcome back!" />
        <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 1.5, }}>
          <TextInput label="Company Email" placeholder="Enter company Email" variant="underlined" />
          <TextInput label="Password" placeholder="Enter Password" type="password" variant="underlined" />
          <Typography component="button" type="button" onClick={() => navigate(paths.auth.forgotPassword)} sx={{ mt: 0.5, alignSelf: "flex-end", border: "none", background: "transparent", cursor: "pointer", fontSize: "14px", color: "#4F46E5", fontWeight: 500, p: 0, "&:hover": { textDecoration: "underline" } }}>
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