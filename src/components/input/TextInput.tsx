import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import type { UseFormRegisterReturn } from "react-hook-form";

type TextInputProps = {
  label: string;
  type?: string;
  placeholder: string;
  variant?: "outlined" | "underlined";
  registration?: UseFormRegisterReturn;
  error?: string;
};

function TextInput({
  label,
  type = "text",
  placeholder,
  variant = "outlined",
  registration,
  error,
}: TextInputProps) {
  return (
    <Box>
      <Typography
        variant="body2"
        sx={{
          mb: 1,
          fontSize: "14px",
          fontWeight: 500,
          color: "#374151",
        }}
      >
        {label}
      </Typography>

      <TextField
        {...registration}
        error={!!error}
        helperText={error}
        fullWidth
        type={type}
        placeholder={placeholder}
        variant={variant === "underlined" ? "standard" : "outlined"}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "10px",
            backgroundColor: "#FFFFFF",
            height: "52px",

            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#BFC5D2",
            },
          },

          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#D1D5DB",
            borderWidth: "1px",
          },

          "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
            {
              borderColor: "#6D5DF6",
              borderWidth: "2px",
            },

          "& .MuiInputBase-input": {
            fontSize: "15px",
            color: "#111827",
            padding:
              variant === "underlined"
                ? "8px 0"
                : "14px 16px",
          },

          "& .MuiInputBase-input::placeholder": {
            fontSize: "13px",
            color: "#9CA3AF",
            opacity: 1,
          },

          "& .MuiFormHelperText-root": {
            marginLeft: 0,
            marginTop: "4px",
            fontSize: "12px",
          },
        }}
      />
    </Box>
  );
}

export default TextInput;