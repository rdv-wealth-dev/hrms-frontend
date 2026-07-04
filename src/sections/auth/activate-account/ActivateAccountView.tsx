import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import AuthLayout from "../../../layouts/auth/AuthLayout";
import AuthHeading from "../../../components/auth/AuthHeading";
import TextInput from "../../../components/input/TextInput";
import PrimaryButton from "../../../components/button/PrimaryButton";
import AuthFooter from "../../../components/auth/AuthFooter";
import { paths } from "../../../routes/paths";

import type { AppDispatch } from "../../../store/store";
import type { RootState } from "../../../store/rootReducer";
import { activateAccountRequest } from "../../../store/auth";

import {
  activateAccountSchema,
  type ActivateAccountFormData,
} from "../../../validations/auth/activate-account.schema";

function ActivateAccountView() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const { loading, error, isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    if (isAuthenticated && user) {
      switch (user.role) {
        case "SUPER_ADMIN":
          navigate(paths.dashboard);
          break;

        case "HR":
          navigate("/hr/dashboard");
          break;

        case "EMPLOYEE":
          // Redirect employee directly to employee/dashboard
          navigate("/employee/dashboard");
          break;

        default:
          navigate("/");
      }
    }
  }, [isAuthenticated, user, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ActivateAccountFormData>({
    resolver: zodResolver(activateAccountSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: ActivateAccountFormData) => {
    if (!token) return;

    dispatch(
      activateAccountRequest({
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
              No activation token found in the link. Please check the email sent to
              your inbox, or contact your HR administrator.
            </Typography>
            <Box sx={{ mt: 3 }}>
              <AuthFooter
                text="Already activated?"
                linkText="Sign In"
                onClick={() => navigate(paths.auth.login)}
              />
            </Box>
          </>
        )}

        {token && (
          <>
            <AuthHeading
              title="Activate Account"
              subtitle="Set a secure password to activate your workspace."
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
                placeholder="Enter Password"
                type="password"
                variant="outlined"
                registration={register("password")}
                error={errors.password?.message}
              />

              <TextInput
                label="Confirm Password"
                placeholder="Confirm Password"
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

              <Box sx={{ mt: 1 }}>
                <PrimaryButton
                  type="submit"
                  loading={loading}
                  disabled={loading}
                >
                  Activate Account
                </PrimaryButton>
              </Box>

              <AuthFooter
                text="Already activated?"
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

export default ActivateAccountView;
