import TextField from "@mui/material/TextField";

type TextInputProps = {
  label: string;
  type?: string;
  placeholder: string;
  variant?: "outlined" | "underlined";
};

function TextInput({
  label,
  type = "text",
  placeholder,
  variant = "outlined",
}: TextInputProps) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <TextField
        fullWidth
        type={type}
        placeholder={placeholder}
        variant={variant === "underlined" ? "standard" : "outlined"}
      />
    </div>
  );
}

export default TextInput;