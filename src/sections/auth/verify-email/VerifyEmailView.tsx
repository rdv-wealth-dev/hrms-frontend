import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";

import AuthLayout from "../../../layouts/auth/AuthLayout";
import AuthHeading from "../../../components/auth/AuthHeading";
import PrimaryButton from "../../../components/button/PrimaryButton";

import { paths } from "../../../routes/paths";

import type { AppDispatch } from "../../../store/store";
import type { RootState } from "../../../store/rootReducer";
import { verifyEmailRequest } from "../../../store/auth";

function VerifyEmailView() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const { isVerifyingEmail, isEmailVerified, verifyMessage, error } =
    useSelector((state: RootState) => state.auth);

  const hasDispatched = useRef(false);

  useEffect(() => {
    if (token && !hasDispatched.current) {
      hasDispatched.current = true;
      dispatch(verifyEmailRequest({ token }));
    }
  }, [token, dispatch]);

  return (
    <AuthLayout>
      <Box sx={{ width: "100%", maxWidth: "26rem", textAlign: "center" }}>
        {!token && (
          <>
            <AuthHeading title="Invalid Link" subtitle="" />
            <Typography variant="body2" color="error" sx={{ mt: 2 }}>
              No verification token found in the link. Please use the link
              from your email.
            </Typography>
          </>
        )}

        {token && isVerifyingEmail && (
          <>
            <AuthHeading title="Verifying your email" subtitle="" />
            <Box sx={{ mt: 3 }}>
              <CircularProgress />
            </Box>
          </>
        )}

        {token && isEmailVerified && (
          <>
            <AuthHeading title="Email Verified" subtitle="" />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 3 }}>
              {verifyMessage ?? "Your email has been verified successfully."}
            </Typography>
            <PrimaryButton onClick={() => navigate(paths.auth.login)}>
              Go to Login
            </PrimaryButton>
          </>
        )}

        {token && !isVerifyingEmail && !isEmailVerified && error && (
          <>
            <AuthHeading title="Verification Failed" subtitle="" />
            <Typography variant="body2" color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          </>
        )}
      </Box>
    </AuthLayout>
  );
}

export default VerifyEmailView;