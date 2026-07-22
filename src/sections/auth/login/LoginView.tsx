import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import AuthLayout from "../../../layouts/auth/AuthLayout";
import AuthHeading from "../../../components/auth/AuthHeading";
import TextInput from "../../../components/input/TextInput";
import PrimaryButton from "../../../components/button/PrimaryButton";
import AuthFooter from "../../../components/auth/AuthFooter";

import { paths } from "../../../routes/paths";

import { loginSchema, type LoginFormData } from "../../../validations/auth/login.schema";

import { loginRequest } from "../../../store/auth";
import type { AppDispatch } from "../../../store/store";
import type { RootState } from "../../../store/rootReducer";

function LoginView() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const {
    loading,
    error,
    isAuthenticated,
    user,
  } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isAuthenticated && user) {
      switch (user.role) {
        case "ORG_ADMIN":
          navigate(paths.dashboard);
          break;

        case "HR":
          navigate("/hr/dashboard");
          break;

        case "EMPLOYEE":
          navigate("/employee/dashboard");
          break;

        default:
          navigate("/");
      }
    }
  }, [isAuthenticated, user, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormData) => {
    dispatch(loginRequest(data));
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
            registration={register("email")}
            error={errors.email?.message}
          />

          <TextInput
            label="Password"
            placeholder="Enter Password"
            type="password"
            registration={register("password")}
            error={errors.password?.message}
          />

          <Typography
            component="button"
            type="button"
            onClick={() => navigate(paths.auth.forgotPassword)}
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

          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}

          <PrimaryButton
            type="submit"
            loading={loading}
            disabled={loading}
          >
            Sign In
          </PrimaryButton>

         

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