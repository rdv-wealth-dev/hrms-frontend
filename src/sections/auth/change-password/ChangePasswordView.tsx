import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import LockResetOutlinedIcon from "@mui/icons-material/LockResetOutlined";

import AuthLayout from "../../../layouts/auth/AuthLayout";
import TextInput from "../../../components/input/TextInput";
import PrimaryButton from "../../../components/button/PrimaryButton";

import { paths } from "../../../routes/paths";
import type { RootState } from "../../../store/rootReducer";
import axiosInstance from "../../../api/axios";

// ─── Zod schema ────────────────────────────────────────────────────────────
// Mirrors backend ChangePasswordDto: currentPassword + newPassword (different)
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    message: "New password must be different from your current password",
    path: ["newPassword"],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// ─── Component ─────────────────────────────────────────────────────────────

export default function ChangePasswordView() {
  const navigate = useNavigate();
  const { user, requiresPasswordReset } = useSelector(
    (state: RootState) => state.auth
  );

  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // If user somehow reaches this page without the flag, redirect to dashboard
  useEffect(() => {
    if (!requiresPasswordReset) {
      navigate(paths.dashboard, { replace: true });
    }
  }, [requiresPasswordReset, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    setSubmitting(true);
    setApiError(null);

    try {
      // NOTE: Backend ChangePasswordDto exists (auth.dto.ts) but route is not yet
      // registered. When backend adds POST /api/v1/auth/change-password (auth-protected),
      // this call will work automatically — token is sent via axiosInstance interceptor.
      await axiosInstance.post(
        "/auth/change-password",
        {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      setSuccess(true);

      // Short delay then redirect to role-based destination
      setTimeout(() => {
        switch (user?.role) {
          case "ORG_ADMIN": navigate(paths.dashboard, { replace: true }); break;
          case "HR":        navigate("/hr/dashboard", { replace: true }); break;
          case "EMPLOYEE":  navigate("/employee/dashboard", { replace: true }); break;
          default:          navigate(paths.dashboard, { replace: true });
        }
      }, 1500);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        "Failed to update password. Please try again.";
      setApiError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <Box sx={{ width: "100%", maxWidth: "28rem" }}>
        {/* Icon + heading */}
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: "16px",
              backgroundColor: "#EDE9FE",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2,
            }}
          >
            <LockResetOutlinedIcon sx={{ fontSize: 28, color: "#6D5DF6" }} />
          </Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, color: "#0F172A", mb: 0.5 }}
          >
            Set Your Password
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748B", fontSize: "14px" }}>
            Your account requires a new password before you can continue.
            {user?.email && (
              <Box component="span" sx={{ display: "block", mt: 0.5, fontWeight: 600, color: "#334155" }}>
                {user.email}
              </Box>
            )}
          </Typography>
        </Box>

        {success ? (
          <Alert severity="success" sx={{ borderRadius: 2 }}>
            Password updated! Redirecting you now…
          </Alert>
        ) : (
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextInput
              label="Current Password"
              placeholder="Your temporary / current password"
              type="password"
              registration={register("currentPassword")}
              error={errors.currentPassword?.message}
              required
            />

            <TextInput
              label="New Password"
              placeholder="At least 8 chars, 1 upper, 1 number, 1 symbol"
              type="password"
              registration={register("newPassword")}
              error={errors.newPassword?.message}
              required
            />

            <TextInput
              label="Confirm New Password"
              placeholder="Repeat new password"
              type="password"
              registration={register("confirmPassword")}
              error={errors.confirmPassword?.message}
              required
            />

            {apiError && (
              <Alert severity="error" sx={{ borderRadius: 2, fontSize: "13px" }}>
                {apiError}
              </Alert>
            )}

            <Box sx={{ mt: 1 }}>
              <PrimaryButton type="submit" loading={submitting} disabled={submitting}>
                Update Password & Continue
              </PrimaryButton>
            </Box>
          </Box>
        )}
      </Box>
    </AuthLayout>
  );
}
