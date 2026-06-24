type PrimaryButtonProps = {
  type?: 'button' | 'submit' | 'reset'
  children: React.ReactNode
}

function PrimaryButton({
  type = 'button',
  children,
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      className="
         w-full
        h-12
        rounded-xl
        bg-[#6D5DF6]
        text-white
        font-semibold
        shadow-lg
        transition-all
        duration-200
        hover:opacity-95
        hover:scale-[1.01]
        active:scale-[0.99]
      "
    >
      {children}
    </button>
  )
}

export default PrimaryButton