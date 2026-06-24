import Box from "@mui/material/Box";
import TextInput from '../../../components/input/TextInput'
import PrimaryButton from '../../../components/button/PrimaryButton'
import AuthLayout from '../../../layouts/auth/AuthLayout'
import AuthDivider from '../../../components/auth/AuthDivider'
import GoogleAuthButton from '../../../components/auth/GoogleAuthButton'
import AuthFooter from '../../../components/auth/AuthFooter'
import AuthHeading from '../../../components/auth/AuthHeading'
import { useNavigate } from "react-router-dom";
import { paths } from "../../../routes/paths";

function SignupView() {

  const navigate = useNavigate();

  return (
    <AuthLayout>


      <Box sx={{ width: "100%", maxWidth: "32rem", }}>

        {/* Logo */}
        {/* <div className="flex items-center gap-2">
        <div className="h-10 w-10 rounded-xl bg-[#6D5DF6]" />

        <span className="text-xl font-bold">
          HRMS
        </span>
      </div> */}
        {/* Heading */}
        <AuthHeading
          title="Sign up"
          subtitle="Join the community today!"
        />



        {/* Form */}
        <Box
          component="form"
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
          }}
        >
          <TextInput
            label="Company Name"
            placeholder="Enter company Name"
            variant="underlined"
          />

          <TextInput
            label="Company Email"
            placeholder="Enter company Email"
            variant="underlined"
          />

          <TextInput
            label="Company Phone Number"
            placeholder="Enter company Phone Number"
            variant="underlined"
          />

          <TextInput
            label="Password"
            placeholder="Enter Password"
            type="password"
            variant="underlined"
          />

          <TextInput
            label="Confirm Password"
            placeholder="Enter Confirm Password"
            type="password"
            variant="underlined"
          />

          <PrimaryButton type="submit">
            Create Account
          </PrimaryButton>
        </Box>


        {/* Divider */}
        <AuthDivider />

        {/* Google Button */}

        <GoogleAuthButton />

        <AuthFooter
          text="Already have an account?"
          linkText="Sign In"
          onClick={() => navigate(paths.auth.login)}
        />


      </Box>








    </AuthLayout>
  )
}

export default SignupView