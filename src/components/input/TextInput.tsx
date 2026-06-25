import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
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
        fullWidth
        type={type}
        placeholder={placeholder}
        variant={variant === "underlined" ? "standard" : "outlined"}
        sx={{
          "& .MuiInputBase-input": {
            fontSize: "15px",
            color: "#111827",
            padding: variant === "underlined" ? "8px 0" : "12px 16px",
          },

          "& .MuiInputBase-input::placeholder": {
            color: "#9CA3AF",
            opacity: 1,
          },

          "& .MuiInput-underline:before": {
            borderBottom: "1px solid #D1D5DB",
          },

          "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
            borderBottom: "1px solid #D1D5DB",
          },

          "& .MuiInput-underline:after": {
            borderBottom: "2px solid #6D5DF6",
          },

          "& .MuiOutlinedInput-root": {
            borderRadius: "12px",
          },

          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#D1D5DB",
          },

          "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
            {
              borderColor: "#6D5DF6",
            },
        }}
      />
    </Box>
  );
}

export default TextInput;