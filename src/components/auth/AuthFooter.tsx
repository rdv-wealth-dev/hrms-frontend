interface AuthFooterProps {
  text: string
  linkText: string
  onClick?: () => void
}

function AuthFooter({
  text,
  linkText,
  onClick,
}: AuthFooterProps) {
  return (
    <div className="mt-6 text-center text-sm text-gray-600">
      {text}{' '}

      <button
        type="button"
        onClick={onClick}
        className="
          font-medium
          text-indigo-600
          hover:text-indigo-700
          hover:underline
          transition
        "
      >
        {linkText}
      </button>
    </div>
  )
}

export default AuthFooter