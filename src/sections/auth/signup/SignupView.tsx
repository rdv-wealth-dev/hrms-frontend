import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import TextInput from "../../../components/input/TextInput";
import PrimaryButton from "../../../components/button/PrimaryButton";
import AuthLayout from "../../../layouts/auth/AuthLayout";
import AuthDivider from "../../../components/auth/AuthDivider";
import GoogleAuthButton from "../../../components/auth/GoogleAuthButton";
import AuthFooter from "../../../components/auth/AuthFooter";
import AuthHeading from "../../../components/auth/AuthHeading";

import { paths } from "../../../routes/paths";

import type { AppDispatch } from "../../../store/store";
import type { RootState } from "../../../store/rootReducer";

import { registerRequest, resetAuthState } from "../../../store/auth";

import {
  signupSchema,
  type SignupFormData,
} from "../../../validations/auth/signup.schema";

function SignupView() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { loading, error, isRegisterSuccess } = useSelector(
    (state: RootState) => state.auth
  );

  // ✅ Navigate to login after successful signup, then reset the flag
  useEffect(() => {
    if (isRegisterSuccess) {
      dispatch(resetAuthState());
      navigate(paths.auth.login);
    }
  }, [isRegisterSuccess, dispatch, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      companyName: "",
      industry: "",
      firstName: "",
      lastName: "",
      email: "",
      countryCode: "",
      phone: "",
      timezone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: SignupFormData) => {
    const { confirmPassword, ...payload } = data;
    dispatch(registerRequest(payload));
  };

  return (
    <AuthLayout>
      <Box sx={{ width: "100%", maxWidth: "32rem" }}>
        <AuthHeading
          title="Sign up"
          subtitle="Join the community today!"
        />

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 2.5,
          }}
        >
          {/* Company Name */}
          <Box sx={{ gridColumn: { xs: "auto", md: "1 / 3" } }}>
            <TextInput
              label="Company Name"
              placeholder="Enter Company Name"
              registration={register("companyName")}
              error={errors.companyName?.message}
            />
          </Box>

          {/* Industry */}
          <Box sx={{ gridColumn: { xs: "auto", md: "1 / 3" } }}>
            <TextInput
              label="Industry"
              placeholder="Enter Industry"
              registration={register("industry")}
              error={errors.industry?.message}
            />
          </Box>

          {/* First Name */}
          <TextInput
            label="First Name"
            placeholder="Enter First Name"
            registration={register("firstName")}
            error={errors.firstName?.message}
          />

          {/* Last Name */}
          <TextInput
            label="Last Name"
            placeholder="Enter Last Name"
            registration={register("lastName")}
            error={errors.lastName?.message}
          />

          {/* Email */}
          <Box sx={{ gridColumn: { xs: "auto", md: "1 / 3" } }}>
            <TextInput
              label="Email"
              placeholder="Enter Email"
              registration={register("email")}
              error={errors.email?.message}
            />
          </Box>

          {/* Country Code */}
          <TextInput
            label="Country Code"
            placeholder="Enter Country Code"
            registration={register("countryCode")}
            error={errors.countryCode?.message}
          />

          {/* Phone */}
          <TextInput
            label="Phone Number"
            placeholder="Enter Phone Number"
            registration={register("phone")}
            error={errors.phone?.message}
          />

          {/* Timezone */}
          <Box sx={{ gridColumn: { xs: "auto", md: "1 / 3" } }}>
            <TextInput
              label="Time Zone"
              placeholder="Enter Time Zone"
              registration={register("timezone")}
              error={errors.timezone?.message}
            />
          </Box>

          {/* Password */}
          <Box sx={{ gridColumn: { xs: "auto", md: "1 / 3" } }}>
            <TextInput
              label="Password"
              placeholder="Enter Password"
              type="password"
              registration={register("password")}
              error={errors.password?.message}
            />
          </Box>

          {/* Confirm Password */}
          <Box sx={{ gridColumn: { xs: "auto", md: "1 / 3" } }}>
            <TextInput
              label="Confirm Password"
              placeholder="Enter Confirm Password"
              type="password"
              registration={register("confirmPassword")}
              error={errors.confirmPassword?.message}
            />
          </Box>

          {/* API Error */}
          {error && (
            <Box sx={{ gridColumn: { xs: "auto", md: "1 / 3" } }}>
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            </Box>
          )}

          {/* Submit */}
          <Box sx={{ gridColumn: { xs: "auto", md: "1 / 3" }, mt: 2 }}>
            <PrimaryButton type="submit" loading={loading} disabled={loading}>
              Create Account
            </PrimaryButton>
          </Box>
        </Box>

        <AuthDivider />
        <GoogleAuthButton />

        <AuthFooter
          text="Already have an account?"
          linkText="Sign In"
          onClick={() => navigate(paths.auth.login)}
        />
      </Box>
    </AuthLayout>
  );
}

export default SignupView;