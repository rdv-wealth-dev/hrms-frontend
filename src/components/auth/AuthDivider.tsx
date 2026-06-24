interface AuthDividerProps {
  text?: string;
}

const AuthDivider = ({
  text = "or continue with",
}: AuthDividerProps) => {
  return (
    <div className="flex items-center gap-4 my-6">
      <div className="flex-1 h-px bg-gray-200" />

      <span className="text-sm text-gray-500 whitespace-nowrap">
        {text}
      </span>

      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
};

export default AuthDivider;