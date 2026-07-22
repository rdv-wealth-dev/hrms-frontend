type Props = {
  children: React.ReactNode
}

function AuthRightSection({ children }: Props) {
  return (
    <div className="flex items-center justify-center p-10">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  )
}

export default AuthRightSection