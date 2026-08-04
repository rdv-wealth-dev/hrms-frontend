type Props = {
  children: React.ReactNode;
};

function AuthLayout({ children }: Props) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#818CF8] flex items-center justify-center p-3 sm:p-5 md:p-8">

      {/* Outer Left Large Circle */}
      <div className="absolute left-4 sm:left-20 bottom-0 h-48 w-48 sm:h-72 sm:w-72 rounded-full bg-white/15 pointer-events-none" />

      {/* Outer Left Small Circle */}
      <div className="absolute left-2 sm:left-10 bottom-36 sm:bottom-52 h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-white/15 pointer-events-none" />

      {/* Outer Right Large Circle */}
      <div className="absolute -right-12 sm:-right-24 top-6 sm:top-12 h-48 w-48 sm:h-72 sm:w-72 rounded-full bg-white/15 pointer-events-none" />

      {/* White Central Card */}
      <div className="relative z-10 w-full max-w-[94vw] sm:max-w-xl md:max-w-2xl overflow-hidden rounded-2xl sm:rounded-3xl bg-[#FCFCFD] shadow-[0_20px_60px_rgba(0,0,0,0.15)] transition-all duration-300 my-auto">
        {/* Card Decorative Circle Left Big */}
        <div className="absolute -left-24 sm:-left-32 -bottom-24 sm:-bottom-32 h-64 w-64 sm:h-80 sm:w-80 rounded-full bg-[#6D5DF6]/10 pointer-events-none" />

        {/* Card Decorative Circle Left Small */}
        <div className="absolute left-3 sm:left-6 bottom-12 sm:bottom-16 h-16 w-16 sm:h-24 sm:w-24 rounded-full bg-[#6D5DF6]/10 pointer-events-none" />

        {/* Card Decorative Circle Right Big */}
        <div className="absolute -right-24 sm:-right-36 -top-16 sm:-top-20 h-72 w-72 sm:h-96 sm:w-96 rounded-full bg-[#6D5DF6]/10 pointer-events-none" />

        {/* Card Decorative Circle Right Small */}
        <div className="absolute -right-8 sm:-right-10 top-4 sm:top-6 h-28 w-28 sm:h-40 sm:w-40 rounded-full bg-[#6D5DF6]/5 pointer-events-none" />

        <div className="relative z-10 flex items-center justify-center py-6 sm:py-7 md:py-9 px-5 sm:px-6 md:px-10 w-full box-sizing-border">
          {children}
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;