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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  signupSchema,
  type SignupFormData,
} from "../../../validations/auth/signup.schema";

function SignupView() {

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = (data: SignupFormData) => {
    console.log("Signup Form Data:", data);
  };

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
        <AuthHeading title="Sign up" subtitle="Join the community today!" />



        {/* Form */}
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "1fr 1fr",
            },
            gap: 2.5,
          }}
        >
          <TextInput
            label="Company Name"
            placeholder="Enter company Name"
            variant="outlined"
            registration={register("companyName")}
            error={errors.companyName?.message}
          />

          <TextInput
            label="Company Email"
            placeholder="Enter company Email"
            variant="outlined"
            registration={register("email")}
            error={errors.email?.message}
          />

          <TextInput
            label="Company Phone Number"
            placeholder="Enter company Phone Number"
            variant="outlined"
            registration={register("phone")}
            error={errors.phone?.message}
          />

          <TextInput
            label="Password"
            placeholder="Enter Password"
            type="password"
            variant="outlined"
            registration={register("password")}
            error={errors.password?.message}
          />

          <Box sx={{ gridColumn: { xs: "auto", md: "1 / 3" } }}>
            <TextInput
              label="Confirm Password"
              placeholder="Enter Confirm Password"
              type="password"
              variant="outlined"
              registration={register("confirmPassword")}
              error={errors.confirmPassword?.message}
            />
          </Box>

          <Box
            sx={{
              gridColumn: { xs: "auto", md: "1 / 3" },
              mt: 2,
            }}
          >
            <PrimaryButton type="submit">
              Create Account
            </PrimaryButton>
          </Box>
        </Box>


        {/* Divider */}
        <AuthDivider />

        {/* Google Button */}

        <GoogleAuthButton />

        <AuthFooter text="Already have an account?" linkText="Sign In" onClick={() => navigate(paths.auth.login)} />

      </Box>

    </AuthLayout>
  )
}

export default SignupView