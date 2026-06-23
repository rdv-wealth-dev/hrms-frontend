type TextInputProps = {
  label: string
  type?: string
  placeholder: string
}

function TextInput({
  label,
  type = 'text',
  placeholder,
}: TextInputProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        className="
          w-full
          h-12
          rounded-xl
          border
          border-gray-300
          px-4
          outline-none
          focus:border-[#6D5DF6]
        "
      />
    </div>
  )
}

export default TextInput