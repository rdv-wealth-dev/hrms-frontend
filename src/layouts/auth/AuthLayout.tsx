import AuthLeftSection from './AuthLeftSection'
import AuthRightSection from './AuthRightSection'

type Props = {
  children: React.ReactNode
}

function AuthLayout({ children }: Props) {
  return (
    <div className="min-h-screen bg-[#6D5DF6] flex items-center justify-center p-6">
      <div className="w-full max-w-6xl bg-white rounded-3xl overflow-hidden shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[700px]">
          <AuthLeftSection />

          <AuthRightSection>
            {children}
          </AuthRightSection>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout