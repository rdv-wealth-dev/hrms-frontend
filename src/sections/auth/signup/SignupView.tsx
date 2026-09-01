import { useState, useEffect, useRef } from "react";

import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";

import TextInput from "../../../components/input/TextInput";
import SlugInput from "../../../components/input/SlugInput";
import PhoneInput from "../../../components/input/PhoneInput";
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

// Employee count options matching backend enum exactly
const EMPLOYEE_COUNT_OPTIONS = [
  { value: "1-10", label: "1 – 10 employees" },
  { value: "11-50", label: "11 – 50 employees" },
  { value: "51-200", label: "51 – 200 employees" },
  { value: "201-500", label: "201 – 500 employees" },
  { value: "500+", label: "500+ employees" },
];

// Sanitise company name → workspace slug suggestion (alphanumeric only, no hyphens)
function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function SignupView() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { loading, error, isRegisterSuccess } = useSelector(
    (state: RootState) => state.auth
  );

  const [submittedEmail, setSubmittedEmail] = useState<string>("");
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  // Track whether the user has manually edited the slug field
  // If true, stop auto-generating from company name
  const isSlugManuallyEdited = useRef(false);

  useEffect(() => {
    if (isRegisterSuccess) {
      dispatch(resetAuthState());
      navigate(paths.auth.checkEmail, { state: { email: submittedEmail } });
    }
  }, [isRegisterSuccess, dispatch, navigate, submittedEmail]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      companyName: "",
      workspaceSlug: "",
      employeeCountRange: undefined,
      industry: "",
      firstName: "",
      lastName: "",
      email: "",
      countryCode: "IN",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Auto-generate slug from company name as user types
  // Stops auto-updating once the user manually edits the slug field
  const companyName = watch("companyName");

  useEffect(() => {
    if (isSlugManuallyEdited.current) return;
    const generated = toSlug(companyName);
    setValue("workspaceSlug", generated);
  }, [companyName]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = (data: SignupFormData) => {
    // Block submit if slug is confirmed taken
    if (slugAvailable === false) return;

    const { confirmPassword, ...rest } = data;
    setSubmittedEmail(rest.email);

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const phone = rest.phone ? rest.phone.replace(/\D/g, "") : undefined;

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
      <Box sx={{ width: "100%", maxWidth: "36rem" }}>
        <Box sx={{ mt: -1 }}>
          <AuthHeading
            title="Create your workspace"
            subtitle="Set up your company HRMS in minutes"
          />
        </Box>

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: { xs: 1, sm: 1.2 },
          }}
        >
          {/* Row 1: Company Name | Team Size */}
          <TextInput
            label="Company Name"

            registration={register("companyName")}
            error={errors.companyName?.message}
            required
          />

          <TextInput
            label="Team Size"
            select
            registration={register("employeeCountRange")}
            error={errors.employeeCountRange?.message}
            required
          >
            <MenuItem value="" disabled>Select team size</MenuItem>
            {EMPLOYEE_COUNT_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextInput>

          {/* Row 2: Workspace Slug (full width) */}
          <Box sx={{ gridColumn: "1 / 3" }}>
            <Controller
              name="workspaceSlug"
              control={control}
              render={({ field }) => (
                <SlugInput
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.workspaceSlug?.message}
                  onAvailabilityChange={setSlugAvailable}
                  onManualEdit={() => { isSlugManuallyEdited.current = true; }}
                />
              )}
            />
          </Box>

          {/* Row 3: First Name | Last Name */}
          <TextInput
            label="First Name"

            registration={register("firstName")}
            error={errors.firstName?.message}
            required
          />

          <TextInput
            label="Last Name"

            registration={register("lastName")}
            error={errors.lastName?.message}
            required
          />

          {/* Row 4: Email (full width) */}
          <Box sx={{ gridColumn: "1 / 3" }}>
            <TextInput
              label="Work Email"

              registration={register("email")}
              error={errors.email?.message}
              required
            />
          </Box>

          {/* Row 5: Password | Confirm Password */}
          <TextInput
            label="Password"

            type="password"
            registration={register("password")}
            error={errors.password?.message}
            required
          />

          <TextInput
            label="Confirm Password"

            type="password"
            registration={register("confirmPassword")}
            error={errors.confirmPassword?.message}
            required
          />

          {/* Row 6: Phone Number (full width, same as Work Email) */}
          <Box sx={{ gridColumn: "1 / 3" }}>
            <PhoneInput
              label="Phone Number"
              phoneRegistration={register("phone")}
              countryCodeRegistration={register("countryCode")}
              phoneError={errors.phone?.message}
              countryCodeError={errors.countryCode?.message}
              setValue={setValue}
              watch={watch}
            />
          </Box>

          {/* API Error */}
          {error && (
            <Box sx={{ gridColumn: "1 / 3" }}>
              <Typography
                color="error"
                variant="body2"
                sx={{ textAlign: "center", fontSize: { xs: "11px", sm: "13px" } }}
              >
                {error}
              </Typography>
            </Box>
          )}

          {/* Slug taken warning */}
          {slugAvailable === false && !errors.workspaceSlug && (
            <Box sx={{ gridColumn: "1 / 3" }}>
              <Typography
                variant="caption"
                sx={{ color: "#EF4444", fontSize: "12px" }}
              >
                Please choose an available workspace URL before continuing.
              </Typography>
            </Box>
          )}

          {/* Submit */}
          <Box sx={{ gridColumn: "1 / 3", mt: { xs: 0.3, sm: 0.6 } }}>
            <PrimaryButton
              type="submit"
              loading={loading}
              disabled={loading || slugAvailable === false}
            >
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