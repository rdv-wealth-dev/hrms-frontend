
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import AuthLayout from "../../../layouts/auth/AuthLayout";
import AuthHeading from "../../../components/auth/AuthHeading";
import TextInput from "../../../components/input/TextInput";
import PrimaryButton from "../../../components/button/PrimaryButton";
import AuthFooter from "../../../components/auth/AuthFooter";
import { paths } from "../../../routes/paths";

import type { AppDispatch } from "../../../store/store";
import type { RootState } from "../../../store/rootReducer";
import { resetPasswordRequest } from "../../../store/auth";

import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "../../../validations/auth/reset-password.schema";

function ResetPasswordView() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const { isResettingPassword, isPasswordReset, resetPasswordMessage, error } =
    useSelector((state: RootState) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = (data: ResetPasswordFormData) => {
    if (!token) return;

    dispatch(
      resetPasswordRequest({
        token,
        password: data.password,
      })
    );
  };

  return (
    <AuthLayout>
      <Box sx={{ width: "100%", maxWidth: "32rem" }}>
        {!token && (
          <>
            <AuthHeading title="Invalid Link" subtitle="" />
            <Typography variant="body2" color="error" sx={{ mt: 2 }}>
              No reset token found in the link. Please use the link from your
              email, or request a new one.
            </Typography>
            <Box sx={{ mt: 3 }}>
              <AuthFooter
                text="Need a new link?"
                linkText="Forgot Password"
                onClick={() => navigate(paths.auth.forgotPassword)}
              />
            </Box>
          </>
        )}

        {token && isPasswordReset && (
          <>
            <AuthHeading title="Password Reset" subtitle="" />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 3 }}>
              {resetPasswordMessage ??
                "Your password has been reset successfully."}
            </Typography>
            <PrimaryButton onClick={() => navigate(paths.auth.login)}>
              Go to Login
            </PrimaryButton>
          </>
        )}

        {token && !isPasswordReset && (
          <>
            <AuthHeading
              title="Reset Password"
              subtitle="Create a new password for your account."
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
                label="New Password"
                placeholder="Enter New Password"
                type="password"
                variant="outlined"
                registration={register("password")}
                error={errors.password?.message}
              />

              <TextInput
                label="Confirm Password"
                placeholder="Confirm New Password"
                type="password"
                variant="outlined"
                registration={register("confirmPassword")}
                error={errors.confirmPassword?.message}
              />

              {error && (
                <Typography color="error" variant="body2">
                  {error}
                </Typography>
              )}

              <PrimaryButton
                type="submit"
                loading={isResettingPassword}
                disabled={isResettingPassword}
              >
                Reset Password
              </PrimaryButton>

              <AuthFooter
                text="Back to"
                linkText="Sign In"
                onClick={() => navigate(paths.auth.login)}
              />
            </Box>
          </>
        )}
      </Box>
    </AuthLayout>
  );
}

export default ResetPasswordView;