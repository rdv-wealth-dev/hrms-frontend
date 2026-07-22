import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useSelector } from "react-redux";

import AuthLayout from "../../../layouts/auth/AuthLayout";
import AuthHeading from "../../../components/auth/AuthHeading";

import type { RootState } from "../../../store/rootReducer";

function CheckEmailView() {
  const { registerMessage } = useSelector((state: RootState) => state.auth);

  return (
    <AuthLayout>
      <Box sx={{ width: "100%", maxWidth: "26rem", textAlign: "center" }}>
        <AuthHeading
          title="Check your email"
          subtitle="We're almost there!"
        />

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          {registerMessage ??
            "We've sent a verification link to your email address. Please click the link to verify your account before logging in."}
        </Typography>
      </Box>
    </AuthLayout>
  );
}

export default CheckEmailView;