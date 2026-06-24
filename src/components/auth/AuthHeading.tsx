interface AuthHeadingProps {
  title: string
  subtitle?: string
}

function AuthHeading({
  title,
  subtitle,
}: AuthHeadingProps) {
  return (
    <div className="mb-4 text-center">
      <h1 className="text-3xl md:text-4xl font-semibold text-gray-900">
        {title}
      </h1>

      {subtitle && (
        <p className="mt-2 text-sm text-gray-500">
          {subtitle}
        </p>
      )}
    </div>
  )
}

export default AuthHeading