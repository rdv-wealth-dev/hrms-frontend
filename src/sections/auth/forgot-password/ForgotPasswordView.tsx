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
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "../../../validations/auth/forgot-password.schema";

function ForgotPasswordView() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (
    data: ForgotPasswordFormData
  ) => {
    console.log("Forgot Password Data:", data);

    // Later this will call API
    navigate(paths.auth.resetPassword);
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
          title="Forgot Password"
          subtitle="Enter your company email and we'll send you a password reset link."
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
            variant="underlined"
            registration={register("email")}
            error={errors.email?.message}
          />

          <PrimaryButton type="submit">
            Send Reset Link
          </PrimaryButton>

          <AuthFooter
            text="Remember your password?"
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

export default ForgotPasswordView;