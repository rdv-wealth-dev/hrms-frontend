import TextInput from '../../../components/input/TextInput'
import PrimaryButton from '../../../components/button/PrimaryButton'
import AuthLayout from '../../../layouts/auth/AuthLayout'

function SignupView() {
  return (
    <AuthLayout>
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="h-10 w-10 rounded-xl bg-[#6D5DF6]" />

        <span className="text-xl font-bold">
          HRMS
        </span>
      </div>

      {/* Heading */}
      <div className="mt-8">
        <h1 className="text-4xl font-bold text-gray-900">
          Create your account
        </h1>

        <p className="mt-3 text-gray-500">
          Welcome! Please fill in the details below.
        </p>
      </div>

      {/* Google Button */}
      <button className="mt-8 w-full h-12 rounded-xl border border-gray-300 bg-white flex items-center justify-center gap-3 font-medium transition hover:bg-gray-50">
        <span>🔵</span>
        Sign up with Google
      </button>

      {/* Divider */}
      <div className="my-8 flex items-center">
        <div className="h-px flex-1 bg-gray-200" />

        <span className="px-4 text-sm text-gray-400">
          or
        </span>

        <div className="h-px flex-1 bg-gray-200" />
      </div>

      {/* Form */}
      <form className="space-y-5">
        <TextInput
          label="Company Name"
          placeholder="Enter company name"
        />

        <TextInput
          label="Company Email"
          type="email"
          placeholder="Enter company email"
        />

        <TextInput
          label="Phone Number"
          type="tel"
          placeholder="Enter phone number"
        />

        <TextInput
          label="Password"
          type="password"
          placeholder="Enter password"
        />

        <TextInput
          label="Confirm Password"
          type="password"
          placeholder="Confirm password"
        />

        <PrimaryButton type="submit">
          Create Account
        </PrimaryButton>
      </form>
    </AuthLayout>
  )
}

export default SignupView