import { useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import AuthLayout from "../../../layouts/auth/AuthLayout";
import AuthHeading from "../../../components/auth/AuthHeading";
import TextInput from "../../../components/input/TextInput";
import PrimaryButton from "../../../components/button/PrimaryButton";
import AuthFooter from "../../../components/auth/AuthFooter";
import { paths } from "../../../routes/paths";

import type { AppDispatch } from "../../../store/store";
import type { RootState } from "../../../store/rootReducer";
import { forgotPasswordRequest } from "../../../store/auth";

import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "../../../validations/auth/forgot-password.schema";

function ForgotPasswordView() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { isSendingResetLink, isResetLinkSent, forgotPasswordMessage, error } =
    useSelector((state: RootState) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    dispatch(forgotPasswordRequest(data));
  };

  // Reset stale state if user navigates back to this page later
  useEffect(() => {
    return () => {
      // no-op cleanup placeholder; add resetAuthState dispatch here if needed later
    };
  }, []);

  return (
    <AuthLayout>
      <Box sx={{ width: "100%", maxWidth: "32rem" }}>
        <AuthHeading
          title="Forgot Password"
          subtitle="Enter your company email and we'll send you a password reset link."
        />

        {isResetLinkSent ? (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {forgotPasswordMessage ??
                "If an account with that email exists, a reset link has been sent."}
            </Typography>

            <Box sx={{ mt: 3 }}>
              <AuthFooter
                text="Remember your password?"
                linkText="Sign In"
                onClick={() => navigate(paths.auth.login)}
              />
            </Box>
          </Box>
        ) : (
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

            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}

            <PrimaryButton type="submit" loading={isSendingResetLink} disabled={isSendingResetLink}>
              Send Reset Link
            </PrimaryButton>

            <AuthFooter
              text="Remember your password?"
              linkText="Sign In"
              onClick={() => navigate(paths.auth.login)}
            />
          </Box>
        )}
      </Box>
    </AuthLayout>
  );
}

export default ForgotPasswordView;