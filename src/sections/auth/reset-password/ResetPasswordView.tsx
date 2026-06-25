import Box from "@mui/material/Box";

import AuthLayout from "../../../layouts/auth/AuthLayout";
import AuthHeading from "../../../components/auth/AuthHeading";
import TextInput from "../../../components/input/TextInput";
import PrimaryButton from "../../../components/button/PrimaryButton";
import AuthFooter from "../../../components/auth/AuthFooter";
import { useNavigate } from "react-router-dom";
import { paths } from "../../../routes/paths";

function ResetPasswordView() {
    const navigate = useNavigate();
    return (
        <AuthLayout>
            <Box sx={{ width: "100%", maxWidth: "32rem", }}>
                <AuthHeading title="Reset Password" subtitle="Create a new password for your account." />
                <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 1.5, }}>
                    <TextInput label="New Password" placeholder="Enter New Password" type="password" variant="underlined" />


                    <TextInput label="Confirm Password" placeholder="Confirm New Password" type="password" variant="underlined" />


                    <PrimaryButton type="submit">
                        Reset Password
                    </PrimaryButton>
                    <AuthFooter text="Back to" linkText="Sign In" onClick={() => navigate(paths.auth.login)}/>
                </Box>
            </Box>
        </AuthLayout>
    );
}

export default ResetPasswordView;