import TextInput from '../../../components/input/TextInput'
import PrimaryButton from '../../../components/button/PrimaryButton'
import AuthLayout from '../../../layouts/auth/AuthLayout'
import AuthDivider from '../../../components/auth/AuthDivider'
import GoogleAuthButton from '../../../components/auth/GoogleAuthButton'
import AuthFooter from '../../../components/auth/AuthFooter'
import AuthHeading from '../../../components/auth/AuthHeading'

function SignupView() {
  return (
    <AuthLayout>
      <div className="w-full max-w-lg">

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
        <form className="space-y-3">
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
        </form>


        {/* Divider */}
        <AuthDivider />

        {/* Google Button */}

        <GoogleAuthButton />

        <AuthFooter
          text="Already a member?"
          linkText="Sign In"
        />
      </div>


    </AuthLayout>
  )
}

export default SignupView