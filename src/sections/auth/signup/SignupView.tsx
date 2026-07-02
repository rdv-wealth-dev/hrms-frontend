import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import TextInput from "../../../components/input/TextInput";
import CountryCodeSelect from "../../../components/input/CountryCodeSelect"; // ✅ added
import PrimaryButton from "../../../components/button/PrimaryButton";
import AuthLayout from "../../../layouts/auth/AuthLayout";
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

  useEffect(() => {
    if (isRegisterSuccess) {
      dispatch(resetAuthState());
      navigate(paths.auth.checkEmail);
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
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: SignupFormData) => {
    const { confirmPassword, ...rest } = data;

    // ✅ Auto-detect timezone — never shown to the user, never typed by them
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Strip all non-digit characters — API expects subscriber digits only (no +, spaces, dashes)
    const phone = rest.phone.replace(/\D/g, "");

    dispatch(
      registerRequest({
        ...rest,
        phone,
        timezone,
      })
    );
  };

  return (
    <AuthLayout>
      <Box sx={{ width: "100%", maxWidth: "32rem" }}>
        <AuthHeading title="Sign up" subtitle="Join the community today!" />

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 1.5,
          }}
        >
          {/* Row 1: Company Name | Industry */}
          <TextInput
            label="Company Name"
            placeholder="Enter Company Name"
            registration={register("companyName")}
            error={errors.companyName?.message}
          />

          <TextInput
            label="Industry"
            placeholder="Enter Industry"
            registration={register("industry")}
            error={errors.industry?.message}
          />

          {/* Row 2: First Name | Last Name */}
          <TextInput
            label="First Name"
            placeholder="Enter First Name"
            registration={register("firstName")}
            error={errors.firstName?.message}
          />

          <TextInput
            label="Last Name"
            placeholder="Enter Last Name"
            registration={register("lastName")}
            error={errors.lastName?.message}
          />

          {/* Row 3: Email — full width */}
          <Box sx={{ gridColumn: "1 / 3" }}>
            <TextInput
              label="Email"
              placeholder="Enter Email"
              registration={register("email")}
              error={errors.email?.message}
            />
          </Box>

          {/* Row 4: Country Code dropdown | Phone */}
          <CountryCodeSelect
            label="Country Code"
            registration={register("countryCode")}
            error={errors.countryCode?.message}
          />

          <TextInput
            label="Phone Number"
            placeholder="e.g. 9876543210"
            type="tel"
            registration={register("phone")}
            error={errors.phone?.message}
          />

          {/* ✅ Time Zone field removed entirely — auto-detected on submit */}

          {/* Row 5: Password | Confirm Password */}
          <TextInput
            label="Password"
            placeholder="Enter Password"
            type="password"
            registration={register("password")}
            error={errors.password?.message}
          />

          <TextInput
            label="Confirm Password"
            placeholder="Enter Confirm Password"
            type="password"
            registration={register("confirmPassword")}
            error={errors.confirmPassword?.message}
          />

          {/* API Error — full width */}
          {error && (
            <Box sx={{ gridColumn: "1 / 3" }}>
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            </Box>
          )}

          {/* Submit — full width */}
          <Box sx={{ gridColumn: "1 / 3", mt: 2 }}>
            <PrimaryButton type="submit" loading={loading} disabled={loading}>
              Create Account
            </PrimaryButton>
          </Box>
        </Box>

        
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