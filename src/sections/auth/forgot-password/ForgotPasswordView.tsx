import Box from "@mui/material/Box";

import AuthLayout from "../../../layouts/auth/AuthLayout";
import AuthHeading from "../../../components/auth/AuthHeading";
import TextInput from "../../../components/input/TextInput";
import PrimaryButton from "../../../components/button/PrimaryButton";
import AuthFooter from "../../../components/auth/AuthFooter";
import { useNavigate } from "react-router-dom";
import { paths } from "../../../routes/paths";

function ForgotPasswordView() {
    const navigate = useNavigate();
    return (
        <AuthLayout>
            <Box sx={{ width: "100%", maxWidth: "32rem", }}>
                <AuthHeading title="Forgot Password" subtitle="Enter your company email and we'll send you a password reset link." />

                <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 1.5, }}>
                    <TextInput label="Company Email" placeholder="Enter company Email" variant="underlined" />
                    <PrimaryButton type="submit">
                        Send Reset Link
                    </PrimaryButton>
                    <AuthFooter
                        text="Remember your password?"
                        linkText="Sign In"
                        onClick={() => navigate(paths.auth.login)}
                    />
                </Box>
            </Box>
        </AuthLayout>
    );
}

export default ForgotPasswordView;