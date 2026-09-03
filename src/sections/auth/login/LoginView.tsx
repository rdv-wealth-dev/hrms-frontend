import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";

import AuthLayout from "../../../layouts/auth/AuthLayout";
import AuthHeading from "../../../components/auth/AuthHeading";
import TextInput from "../../../components/input/TextInput";
import PrimaryButton from "../../../components/button/PrimaryButton";
import AuthFooter from "../../../components/auth/AuthFooter";

import { paths } from "../../../routes/paths";

import { loginSchema, type LoginFormData } from "../../../validations/auth/login.schema";

import { loginRequest, checkEmailRequest, setLoginCooldown } from "../../../store/auth";
import type { AppDispatch } from "../../../store/store";
import type { RootState } from "../../../store/rootReducer";
import { useCountdown } from "../../../hooks/useCountdown";
import { useDebounce } from "../../../hooks/useDebounce";

function LoginView() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const {
    loading,
    error,
    checkEmailError,
    isAuthenticated,
    user,
    requiresPasswordReset,
    onboardingCompleted,
    checkEmailLoading,
    checkEmailResult,
    loginCooldownSeconds,
  } = useSelector((state: RootState) => state.auth);

  const { secondsLeft, isActive, startTimer } = useCountdown(loginCooldownSeconds ?? 0);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Priority 1 — Force password change (HR-invited / admin-reset accounts)
      if (requiresPasswordReset) {
        navigate(paths.auth.changePassword, { replace: true });
        return;
      }

      // Priority 2 — New org first login: complete workspace setup wizard
      if (!onboardingCompleted) {
        navigate(paths.onboarding, { replace: true });
        return;
      }

      // Priority 3 — Normal role-based redirect
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
  }, [isAuthenticated, user, requiresPasswordReset, onboardingCompleted, navigate]);

  useEffect(() => {
    if (loginCooldownSeconds != null && loginCooldownSeconds > 0) {
      startTimer(loginCooldownSeconds);
    }
  }, [loginCooldownSeconds, startTimer]);

  useEffect(() => {
    if (!isActive && loginCooldownSeconds != null) {
      dispatch(setLoginCooldown(null));
    }
  }, [isActive, loginCooldownSeconds, dispatch]);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberDevice: false,
    },
  });

  const emailValue = watch("email");
  const debouncedEmail = useDebounce(emailValue, 500);

  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (debouncedEmail && emailRegex.test(debouncedEmail)) {
      dispatch(checkEmailRequest({ email: debouncedEmail }));
    }
  }, [debouncedEmail, dispatch]);

  const onSubmit = (data: LoginFormData) => {
    dispatch(loginRequest(data));
  };

  const handleResendVerification = useCallback(() => {
    navigate(paths.auth.checkEmail, {
      state: { email: emailValue },
    });
  }, [navigate, emailValue]);

  const ssoEnabled = checkEmailResult?.ssoEnabled;
  const workspaceLogo = checkEmailResult?.logoUrl;
  const companyName = checkEmailResult?.companyName;

  const guessAttemptsLeft = (msg: string): number | null => {
    const match = msg.match(/(\d+)\s*attempt/);
    return match ? parseInt(match[1], 10) : null;
  };

  // Trigger toast on auth errors
  useEffect(() => {
    if (error && !isActive) {
      const isVerif = error.toLowerCase().includes("verif");
      const isDeactivated = error.toLowerCase().includes("deactivated");
      const attempts = guessAttemptsLeft(error);

      let toastMessage = error;
      if (isDeactivated) {
        toastMessage = "Your account has been deactivated. Please contact your administrator.";
      } else if (attempts != null) {
        toastMessage = `${error} (${attempts} attempt${attempts !== 1 ? "s" : ""} remaining)`;
      }

      if (isVerif) {
        toast.error(toastMessage, {
          action: {
            label: "Resend Email",
            onClick: handleResendVerification,
          },
          duration: 10000,
        });
      } else {
        toast.error(toastMessage, {
          duration: 5000,
        });
      }
    }
  }, [error, isActive, handleResendVerification]);

  return (
    <AuthLayout>
      <Box
        sx={{
          width: "100%",
          maxWidth: { xs: "100%", sm: "30rem", md: "34rem" },
          height: { xs: "auto", sm: "520px" },
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          mx: "auto",
        }}
      >
        <Box sx={{ textAlign: "center", mb: 3, minHeight: "140px" }}>
          <Box
            sx={{
              height: workspaceLogo ? 64 : 0,
              transition: "height 0.2s ease, opacity 0.2s ease",
              opacity: workspaceLogo ? 1 : 0,
              overflow: "hidden",
            }}
          >
            {workspaceLogo && (
              <Box
                component="img"
                src={workspaceLogo}
                alt={companyName ?? "Workspace"}
                sx={{ height: 48, mb: 1.5, mx: "auto", display: "block" }}
              />
            )}
          </Box>
          <AuthHeading
            title={companyName || "Sign In"}
            subtitle={companyName ? "Sign in to your workspace" : "Welcome back!"}
            titleSize={
              companyName && companyName.length > 15
                ? { xs: "1.3rem", sm: "1.5rem", md: "1.7rem" }
                : undefined
            }

          />
        </Box>

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: { xs: 1.8, sm: 2 },
            width: "100%",
          }}
        >
          <TextInput
            label="Company Email"
            placeholder="Enter company Email"
            registration={register("email")}
            error={errors.email?.message}
            slotProps={{
              input: {
                endAdornment: checkEmailLoading ? (
                  <InputAdornment position="end" sx={{ mr: 0.5 }}>
                    <CircularProgress size={20} sx={{ color: "primary.main" }} />
                  </InputAdornment>
                ) : null,
              },
            }}
          />

          <Box
            sx={{
              display: ssoEnabled ? "none" : "flex",
              flexDirection: "column",
              gap: { xs: 1.8, sm: 2 },
              width: "100%",
              pb: 0.5,
            }}
          >
            <TextInput
              label="Password"
              placeholder="Enter Password"
              type="password"
              registration={register("password")}
              error={errors.password?.message}
            />

            {/* Remember Device + Forgot Password row */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: -0.5 }}>
              <Controller
                name="rememberDevice"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...field}
                        checked={field.value ?? false}
                        size="small"
                        sx={{ color: "neutral.300", "&.Mui-checked": { color: "primary.main" } }}
                      />
                    }
                    label={
                      <Typography sx={{ fontSize: "13px", color: "#475569" }}>
                        Remember this device
                      </Typography>
                    }
                  />
                )}
              />
              <Typography
                component="button"
                type="button"
                onClick={() => navigate(paths.auth.forgotPassword)}
                sx={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: { xs: "13px", sm: "14px" },
                  color: "#4F46E5",
                  fontWeight: 500,
                  p: 0,
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Forgot Password?
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: ssoEnabled ? "block" : "none" }}>
            <Alert severity="info" sx={{ mt: 1 }}>
              {checkEmailResult?.provider
                ? `Continue with ${checkEmailResult.provider}`
                : "SSO is enabled for this account."}
            </Alert>
          </Box>

          {error && isActive && (
            <Box sx={{ textAlign: "center", mt: 0.5 }}>
              <Typography color="error" variant="body2" sx={{ fontSize: { xs: "13px", sm: "14px" } }}>
                Too many attempts. Try again in {secondsLeft} seconds.
              </Typography>
              <Typography
                component="button"
                type="button"
                onClick={() => navigate(paths.auth.forgotPassword)}
                sx={{
                  mt: 0.5,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: { xs: "12px", sm: "13px" },
                  color: "#4F46E5",
                  fontWeight: 600,
                  textDecoration: "underline",
                  display: "block",
                  mx: "auto",
                }}
              >
                Reset Password?
              </Typography>
            </Box>
          )}

          {checkEmailError && (
            <Box sx={{ textAlign: "center", mt: 0.5 }}>
              <Typography color="error" variant="body2" sx={{ fontSize: { xs: "13px", sm: "14px" } }}>
                {checkEmailError}
              </Typography>
            </Box>
          )}

          {!ssoEnabled && (
            <Box sx={{ mt: 1 }}>
              <PrimaryButton
                type="submit"
                loading={loading}
                disabled={loading || isActive}
              >
                Sign In
              </PrimaryButton>
            </Box>
          )}

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
