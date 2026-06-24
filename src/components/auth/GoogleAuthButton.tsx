interface GoogleAuthButtonProps {
  text?: string
  onClick?: () => void
}

function GoogleAuthButton({
  text = 'Continue with Google',
  onClick,
}: GoogleAuthButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
         w-full
        h-11
        flex
        items-center
        justify-center
        gap-3
        rounded-xl
        border
        border-gray-300
        bg-gray-50
        px-4
        text-sm
        font-medium
        text-gray-700
        transition-all
        duration-200
        hover:bg-gray-50
        hover:border-gray-300
        hover:shadow-sm
      "
    >
      <img
        src="https://www.svgrepo.com/show/475656/google-color.svg"
        alt="Google"
        className="h-5 w-5"
      />

      <span>{text}</span>
    </button>
  )
}

export default GoogleAuthButton