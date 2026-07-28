import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";

import AuthLayout from "../../../layouts/auth/AuthLayout";
import AuthHeading from "../../../components/auth/AuthHeading";
import PrimaryButton from "../../../components/button/PrimaryButton";
import TextInput from "../../../components/input/TextInput";

import { useCountdown } from "../../../hooks/useCountdown";
import { resendVerificationEmail } from "../../../api/auth.api";
import { paths } from "../../../routes/paths";
import type { RootState } from "../../../store/rootReducer";

function CheckEmailView() {
  const location = useLocation();
  const navigate = useNavigate();
  const { registerMessage } = useSelector((state: RootState) => state.auth);

  const initialEmail = (location.state as { email?: string })?.email || "";
  const [email, setEmail] = useState<string>(initialEmail);
  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showEmailInput, setShowEmailInput] = useState<boolean>(!initialEmail);

  const { isActive, formattedTime, startTimer, setSeconds } = useCountdown(120);

  const handleResend = async () => {
    if (!email || !email.trim()) {
      setErrorMessage("Please enter a valid email address.");
      setShowEmailInput(true);
      return;
    }

    setLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await resendVerificationEmail({ email: email.trim() });
      if (res.succeeded !== false && res.success !== false) {
        setSuccessMessage(
          res.data?.message || res.message || "A new verification link has been sent to your email address."
        );
        startTimer(120);
      } else {
        setErrorMessage(res.message || "Failed to resend verification email.");
      }
    } catch (err: any) {
      const apiMsg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0] ||
        err?.message ||
        "An unexpected error occurred.";

      setErrorMessage(apiMsg);

      // Check if 429 rate-limited and extract remaining seconds from message (e.g. "Please wait 104 seconds...")
      if (err?.response?.status === 429 || apiMsg.toLowerCase().includes("seconds")) {
        const match = apiMsg.match(/(\d+)\s*seconds/i);
        if (match && match[1]) {
          const remainingSecs = parseInt(match[1], 10);
          if (!isNaN(remainingSecs) && remainingSecs > 0) {
            setSeconds(remainingSecs);
          } else {
            startTimer(120);
          }
        } else {
          startTimer(120);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Box sx={{ width: "100%", maxWidth: "28rem", textAlign: "center" }}>
        <AuthHeading title="Check your email" subtitle="We're almost there!" />

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 2 }}>
          {registerMessage ??
            `We've sent a verification link to ${email ? `"${email}"` : "your email address"}. Please check your inbox and verify your account before logging in.`}
        </Typography>

        {showEmailInput ? (
          <Box sx={{ mb: 2, textAlign: "left" }}>
            <TextInput
              label="Email Address"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Box>
        ) : (
          <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 2 }}>
            Didn't get the email or need to change email?{" "}
            <Link
              component="button"
              variant="caption"
              underline="hover"
              onClick={() => setShowEmailInput(true)}
              sx={{ fontWeight: 600, color: "#4F46E5" }}
            >
              Edit Email
            </Link>
          </Typography>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2, textAlign: "left" }}>
            {successMessage}
          </Alert>
        )}

        {errorMessage && (
          <Alert severity="warning" sx={{ mb: 2, textAlign: "left" }}>
            {errorMessage}
          </Alert>
        )}

        <Box sx={{ mt: 2 }}>
          <PrimaryButton
            type="button"
            onClick={handleResend}
            loading={loading}
            disabled={loading || isActive}
          >
            {isActive
              ? `Resend email in ${formattedTime}`
              : "Resend Verification Email"}
          </PrimaryButton>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Button
            variant="text"
            onClick={() => navigate(paths.auth.login)}
            sx={{ textTransform: "none", color: "#4F46E5", fontWeight: 600 }}
          >
            Back to Sign In
          </Button>
        </Box>
      </Box>
    </AuthLayout>
  );
}

export default CheckEmailView;