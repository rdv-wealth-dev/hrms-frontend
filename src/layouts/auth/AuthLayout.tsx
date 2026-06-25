type Props = {
  children: React.ReactNode
}

function AuthLayout({ children }: Props) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#818CF8] flex items-center justify-center">

      {/* Left Large Circle */}
      <div className="absolute left-20 bottom-0 h-72 w-72 rounded-full bg-white/15" />

      {/* Left Small Circle */}
      <div
        className=" absolute left-10 bottom-52 h-16 w-16 rounded-full bg-white/15" />

      {/* Right Large Circle */}
      <div className="absolute -right-24 top-12 h-72 w-72 rounded-full bg-white/15" />


      {/* White Card */}
      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl bg-[#FCFCFD] shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
        {/* Card Decorative Circle Left */}
        {/* Left Big */}
        <div className="absolute -left-32 bottom: -120px; h-80 w-80 rounded-full bg-[#6D5DF6]/8" />

        {/* Left Small */}
        <div className="absolute  left: -20px; bottom-15 h-24 w-24 rounded-full bg-[#6D5DF6]/8" />

        {/* Right Big */}
        <div className="absolute -right-36 -top-20 h-96 w-96 rounded-full bg-[#6D5DF6]/8" />

        {/* Right Small */}
        <div className="absolute   right: -40px; top-6 h-40 w-40 rounded-full bg-[#6D5DF6]/5" />
        <div className="flex items-center justify-center p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

export default AuthLayout