import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
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
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const resolvedType = isPassword ? (showPassword ? "text" : "password") : type;

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
        type={resolvedType}
        placeholder={placeholder}
        variant={variant === "underlined" ? "standard" : "outlined"}
        slotProps={{
          input: isPassword
            ? {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                      size="small"
                      tabIndex={-1}
                      disableRipple
                      sx={{
                        color: showPassword ? "#6D5DF6" : "#9CA3AF",
                        mr: 0.5,
                        "&:hover": { color: "#6D5DF6", background: "transparent" },
                      }}
                    >
                      {showPassword ? (
                        <VisibilityOutlinedIcon sx={{ fontSize: 20 }} />
                      ) : (
                        <VisibilityOffOutlinedIcon sx={{ fontSize: 20 }} />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }
            : {},
        }}
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