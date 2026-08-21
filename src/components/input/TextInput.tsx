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
          const max = maxLength || 10;
          target.value = target.value.replace(/\D/g, "").slice(0, max);
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
    select: {
      MenuProps: {
        disableScrollLock: true,
        anchorOrigin: { vertical: "bottom", horizontal: "left" },
        transformOrigin: { vertical: "top", horizontal: "left" },
        slotProps: {
          backdrop: {
            invisible: true,
            style: { backdropFilter: "none", backgroundColor: "transparent" },
          },
        },
        PaperProps: {
          sx: {
            maxHeight: { xs: "184px !important", sm: "176px !important" },
            maxWidth: "calc(100vw - 32px)",
            borderRadius: "12px",
            border: "1px solid #E2E8F0",
            boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.05)",
            overflowY: "auto",
            scrollbarWidth: "thin",
            scrollbarColor: "#CBD5E1 transparent",
            "&::-webkit-scrollbar": { width: "5px" },
            "&::-webkit-scrollbar-track": { background: "transparent" },
            "&::-webkit-scrollbar-thumb": { background: "#CBD5E1", borderRadius: "10px" },
            "&::-webkit-scrollbar-thumb:hover": { background: "#94A3B8" },
            "& .MuiMenuItem-root": {
              fontSize: { xs: "13.5px", sm: "14px" },
              minHeight: { xs: "44px !important", sm: "40px !important" },
              height: { xs: "auto", sm: "40px" },
              whiteSpace: { xs: "normal", sm: "nowrap" },
              wordBreak: { xs: "break-word", sm: "normal" },
              py: { xs: 1, sm: 0 },
              px: { xs: 1.5, sm: 1.8 },
              borderRadius: "6px",
              mx: 0.5,
              my: 0.2,
              color: "#334155",
              "&:hover": { backgroundColor: "#F1F5F9", color: "#0F172A" },
              "&.Mui-selected": { backgroundColor: "#EEF2FF", color: "#4F46E5", fontWeight: 600 },
            },
          },
        },
        ...slotProps?.select?.MenuProps,
      },
      ...slotProps?.select,
    },
  };

  const fieldStyles =
    variant === "underlined"
      ? {
          "& .MuiInputBase-input": { padding: "8px 0" },
          ...sx,
        }
      : {
          "& .MuiOutlinedInput-root": {
            minHeight: multiline ? "auto" : 40,
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
            py: multiline ? "10px" : "8px",
            px: "14px",
            fontSize: "14px",
            color: "#0F172A",
            boxSizing: "border-box",
            "&[type='date']": {
              position: "relative",
              colorScheme: "light",
              "&::-webkit-calendar-picker-indicator": {
                cursor: "pointer",
                borderRadius: "4px",
                padding: "2px",
                filter: "invert(0.3)",
                transition: "all 0.15s ease",
                "&:hover": {
                  filter: "invert(0.1)",
                  backgroundColor: "rgba(109, 93, 246, 0.08)",
                },
              },
            },
            "&:-webkit-autofill, &:-webkit-autofill:hover, &:-webkit-autofill:focus, &:-webkit-autofill:active": {
              WebkitBoxShadow: "0 0 0 1000px #FFFFFF inset !important",
              WebkitTextFillColor: "#0F172A !important",
              transition: "background-color 5000s ease-in-out 0s",
              borderRadius: "12px",
            },
          },
          "& .MuiInputBase-input::placeholder": {
            color: "#94A3B8",
            opacity: 1,
            fontSize: "13.5px",
            fontWeight: 400,
          },
          "& .MuiSelect-select": {
            py: "8px !important",
            minHeight: "22px !important",
            display: "flex",
            alignItems: "center",
            boxSizing: "border-box",
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