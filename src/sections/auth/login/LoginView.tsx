import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import AuthLayout from "../../../layouts/auth/AuthLayout";
import AuthHeading from "../../../components/auth/AuthHeading";
import TextInput from "../../../components/input/TextInput";
import PrimaryButton from "../../../components/button/PrimaryButton";
import AuthDivider from "../../../components/auth/AuthDivider";
import GoogleAuthButton from "../../../components/auth/GoogleAuthButton";
import AuthFooter from "../../../components/auth/AuthFooter";
import { paths } from "../../../routes/paths";
import { loginSchema, type LoginFormData, } from "../../../validations/auth/login.schema";
import { zodResolver } from "@hookform/resolvers/zod";


function LoginView() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    console.log("Login Form Data:", data);
  };

  return (
    <AuthLayout>
      <Box
        sx={{
          width: "100%",
          maxWidth: "32rem",
        }}
      >
        <AuthHeading
          title="Sign In"
          subtitle="Welcome back!"
        />

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
          }}
        >
          <TextInput
            label="Company Email"
            placeholder="Enter company Email"
            variant="outlined"
            registration={register("email")}
            error={errors.email?.message}
          />

          <TextInput
            label="Password"
            placeholder="Enter Password"
            type="password"
            variant="outlined"
            registration={register("password")}
            error={errors.password?.message}
          />

          <Typography
            component="button"
            type="button"
            onClick={() =>
              navigate(paths.auth.forgotPassword)
            }
            sx={{
              mt: 0.5,
              alignSelf: "flex-end",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: "14px",
              color: "#4F46E5",
              fontWeight: 500,
              p: 0,
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
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
            onClick={() =>
              navigate(paths.auth.signup)
            }
          />
        </Box>
      </Box>
    </AuthLayout>
  );
}

export default LoginView;