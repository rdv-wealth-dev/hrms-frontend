import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

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
  } = useForm<LoginFormData>({
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
    if (debouncedEmail) {
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

  const isDeactivatedError = error?.toLowerCase().includes("deactivated");
  const isVerificationError = error?.toLowerCase().includes("verif");
  const attemptsLeft = error ? guessAttemptsLeft(error) : null;

  return (
    <AuthLayout>
      <Box
        sx={{
          width: "100%",
          maxWidth: { xs: "100%", sm: "28rem", md: "32rem" },
          mx: "auto",
        }}
      >
        {workspaceLogo || companyName ? (
          <Box sx={{ textAlign: "center", mb: 3 }}>
            {workspaceLogo && (
              <Box
                component="img"
                src={workspaceLogo}
                alt={companyName ?? "Workspace"}
                sx={{ height: 48, mb: 1, mx: "auto" }}
              />
            )}
            {companyName && (
              <Typography variant="h6" sx={{ fontWeight: 600, color: "text.primary" }}>
                {companyName}
              </Typography>
            )}
          </Box>
        ) : (
          <AuthHeading title="Sign In" subtitle="Welcome back!" />
        )}

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
          />

          {checkEmailLoading && (
            <Typography variant="caption" sx={{ color: "text.secondary", textAlign: "center" }}>
              Checking email...
            </Typography>
          )}

          {!ssoEnabled && (
            <>
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
                          sx={{ color: "#CBD5E1", "&.Mui-checked": { color: "#6D5DF6" } }}
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
            </>
          )}

          {ssoEnabled && (
            <Alert severity="info" sx={{ mt: 1 }}>
              {checkEmailResult?.provider
                ? `Continue with ${checkEmailResult.provider}`
                : "SSO is enabled for this account."}
            </Alert>
          )}

          {error && (
            <Box sx={{ textAlign: "center", mt: 0.5 }}>
              {isDeactivatedError ? (
                <Typography color="error" variant="body2" sx={{ fontSize: { xs: "13px", sm: "14px" } }}>
                  Your account has been deactivated. Please contact your administrator.
                </Typography>
              ) : isActive ? (
                <Typography color="error" variant="body2" sx={{ fontSize: { xs: "13px", sm: "14px" } }}>
                  Too many attempts. Try again in {secondsLeft} seconds.
                </Typography>
              ) : (
                <Typography color="error" variant="body2" sx={{ fontSize: { xs: "13px", sm: "14px" } }}>
                  {error}
                  {attemptsLeft != null && (
                    <Box component="span" sx={{ display: "block", mt: 0.5 }}>
                      {attemptsLeft} attempt{attemptsLeft !== 1 ? "s" : ""} remaining.
                    </Box>
                  )}
                </Typography>
              )}

              {isVerificationError && !isActive && (
                <Typography
                  component="button"
                  type="button"
                  onClick={handleResendVerification}
                  sx={{
                    mt: 0.5,
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    fontSize: { xs: "12px", sm: "13px" },
                    color: "#4F46E5",
                    fontWeight: 600,
                    textDecoration: "underline",
                  }}
                >
                  Need a new verification email? Resend Email
                </Typography>
              )}

              {(isActive || isDeactivatedError) && (
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
                  }}
                >
                  Reset Password?
                </Typography>
              )}
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
