type TextInputProps = {
  label: string
  type?: string
  placeholder: string
  variant?: 'outlined' | 'underlined'
}

function TextInput({
  label,
  type = 'text',
  placeholder,
  variant = 'outlined',
}: TextInputProps) {
  const outlinedStyles = `
    w-full
    h-12
    rounded-xl
    border
    border-gray-300
    px-4
    outline-none
    focus:border-[#6D5DF6]
  `

  const underlinedStyles = `
    w-full
    py-2
    border-b
    border-gray-300
    bg-transparent
    outline-none
    focus:border-[#6D5DF6]
  `

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        className={
          variant === 'underlined'
            ? underlinedStyles
            : outlinedStyles
        }
      />
    </div>
  )
}

export default TextInput