import Box from "@mui/material/Box";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

import AuthLayout from "../../../layouts/auth/AuthLayout";
import AuthHeading from "../../../components/auth/AuthHeading";
import TextInput from "../../../components/input/TextInput";
import PrimaryButton from "../../../components/button/PrimaryButton";
import AuthFooter from "../../../components/auth/AuthFooter";
import { paths } from "../../../routes/paths";

import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "../../../validations/auth/reset-password.schema";

function ResetPasswordView() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = (
    data: ResetPasswordFormData
  ) => {
    console.log("Reset Password Data:", data);

    // Later this will call API
    navigate(paths.auth.login);
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
            variant="underlined"
            registration={register("password")}
            error={errors.password?.message}
          />

          <TextInput
            label="Confirm Password"
            placeholder="Confirm New Password"
            type="password"
            variant="underlined"
            registration={register("confirmPassword")}
            error={errors.confirmPassword?.message}
          />

          <PrimaryButton type="submit">
            Reset Password
          </PrimaryButton>

          <AuthFooter
            text="Back to"
            linkText="Sign In"
            onClick={() =>
              navigate(paths.auth.login)
            }
          />
        </Box>
      </Box>
    </AuthLayout>
  );
}

export default ResetPasswordView;