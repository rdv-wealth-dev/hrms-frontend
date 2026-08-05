import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import type { UseFormRegisterReturn } from "react-hook-form";

export type TextInputProps = {
  label?: string;
  type?: string;
  placeholder?: string;
  variant?: "outlined" | "underlined";
  registration?: UseFormRegisterReturn;
  error?: string;
  value?: any;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  select?: boolean;
  children?: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
  size?: "small" | "medium";
  maxLength?: number;
  min?: number;
  slotProps?: any;
  sx?: any;
};

function TextInput({
  label,
  type = "text",
  placeholder,
  variant = "outlined",
  registration,
  error,
  value,
  onChange,
  onBlur,
  select,
  children,
  required,
  disabled,
  multiline,
  rows,
  size,
  maxLength,
  min,
  slotProps,
  sx,
}: TextInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const resolvedType = isPassword ? (showPassword ? "text" : "password") : type;

  const mergedSlotProps = {
    htmlInput: {
      ...(type === "number" ? { min: min !== undefined ? min : 0 } : {}),
      ...(maxLength !== undefined ? { maxLength } : {}),
      onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (type === "number" && (e.key === "-" || e.key === "e" || e.key === "E")) {
          e.preventDefault();
        }
        if (type === "tel") {
          const isControlKey = [
            "Backspace",
            "Delete",
            "ArrowLeft",
            "ArrowRight",
            "Tab",
            "Home",
            "End",
            "Enter",
            "Escape",
          ].includes(e.key) || e.ctrlKey || e.metaKey;

          if (!isControlKey && !/^\d$/.test(e.key)) {
            e.preventDefault();
          }
        }
        slotProps?.htmlInput?.onKeyDown?.(e);
      },
      onInput: (e: React.FormEvent<HTMLInputElement>) => {
        if (type === "tel") {
          const target = e.target as HTMLInputElement;
          target.value = target.value.replace(/\D/g, "");
        }
        slotProps?.htmlInput?.onInput?.(e);
      },
      ...slotProps?.htmlInput,
    },
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
                  <VisibilityOutlinedIcon sx={{ fontSize: 19 }} />
                ) : (
                  <VisibilityOffOutlinedIcon sx={{ fontSize: 19 }} />
                )}
              </IconButton>
            </InputAdornment>
          ),
          ...slotProps?.input,
        }
      : slotProps?.input,
    select: slotProps?.select,
  };

  const fieldStyles =
    variant === "underlined"
      ? {
          "& .MuiInputBase-input": { padding: "8px 0" },
          ...sx,
        }
      : {
          "& .MuiOutlinedInput-root": {
            height: multiline ? "auto" : 40,
            borderRadius: "12px",
            backgroundColor: "#FFFFFF",
            fontSize: "14px",
            color: "#0F172A",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            "& fieldset": {
              borderColor: "#E2E8F0",
              borderWidth: "1.5px",
            },
            "&:hover fieldset": {
              borderColor: "#CBD5E1",
            },
            "&.Mui-focused": {
              backgroundColor: "#FFFFFF",
              "& fieldset": {
                borderColor: "#6D5DF6",
                borderWidth: "2px",
              },
              boxShadow: "0 0 0 3px rgba(109, 93, 246, 0.12)",
            },
          },
          "& .MuiOutlinedInput-input": {
            py: multiline ? "10px" : "10px",
            px: "14px",
            fontSize: "14px",
            color: "#0F172A",
          },
          "& .MuiInputBase-input::placeholder": {
            color: "#94A3B8",
            opacity: 1,
            fontSize: "13.5px",
            fontWeight: 400,
          },
          "& .MuiSelect-select": {
            py: "10px !important",
            display: "flex",
            alignItems: "center",
          },
          ...sx,
        };

  const extraProps: any = {};
  if (value !== undefined) {
    extraProps.value = value ?? "";
  } else if (select) {
    extraProps.defaultValue = "";
  }
  if (onChange !== undefined) {
    extraProps.onChange = onChange;
  }
  if (onBlur !== undefined) {
    extraProps.onBlur = onBlur;
  }

  return (
    <Box sx={{ width: "100%" }}>
      {label && (
        <Typography
          sx={{
            fontSize: "13px",
            fontWeight: 600,
            color: "#334155",
            mb: 0.6,
            display: "block",
          }}
        >
          {label} {required && <span style={{ color: "#EF4444" }}>*</span>}
        </Typography>
      )}

      <TextField
        {...registration}
        {...extraProps}
        error={!!error}
        helperText={error}
        fullWidth
        type={resolvedType}
        placeholder={placeholder}
        variant={variant === "underlined" ? "standard" : "outlined"}
        select={select}
        required={required}
        disabled={disabled}
        multiline={multiline}
        rows={rows}
        size={size}
        slotProps={mergedSlotProps}
        sx={fieldStyles}
      >
        {children}
      </TextField>
    </Box>
  );
}

export default TextInput;