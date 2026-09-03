import { useState } from "react";
import { alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Tooltip from "@mui/material/Tooltip";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import type { UseFormRegisterReturn } from "react-hook-form";

export type InputFormat = "aadhaar" | "pan" | "numeric" | "alphanumeric" | "uppercase";

export type TextInputProps = {
  label?: string;
  tooltip?: string;
  type?: string;
  format?: InputFormat;
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
  InputProps?: any;
  inputProps?: any;
  sx?: any;
  [key: string]: any;
};

function TextInput({
  label,
  tooltip,
  type = "text",
  format,
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
  InputProps,
  inputProps,
  sx,
}: TextInputProps) {


  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const resolvedType = isPassword ? (showPassword ? "text" : "password") : type;

  // Resolve effective maxLength based on format
  const resolvedMaxLength =
    maxLength !== undefined
      ? maxLength
      : format === "aadhaar"
        ? 12
        : format === "pan"
          ? 10
          : type === "tel"
            ? 10
            : undefined;

  const mergedSlotProps = {
    htmlInput: {
      ...(type === "number" ? { min: min !== undefined ? min : 0 } : {}),
      ...(resolvedMaxLength !== undefined ? { maxLength: resolvedMaxLength } : {}),
      onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
        const isControlKey =
          [
            "Backspace",
            "Delete",
            "ArrowLeft",
            "ArrowRight",
            "Tab",
            "Home",
            "End",
            "Enter",
            "Escape",
          ].includes(e.key) ||
          e.ctrlKey ||
          e.metaKey;

        if (type === "number" && (e.key === "-" || e.key === "e" || e.key === "E")) {
          e.preventDefault();
        }
        if (type === "tel" || format === "aadhaar" || format === "numeric") {
          if (!isControlKey && !/^\d$/.test(e.key)) {
            e.preventDefault();
          }
        }
        if (format === "pan" || format === "alphanumeric") {
          if (!isControlKey && !/^[a-zA-Z0-9]$/.test(e.key)) {
            e.preventDefault();
          }
        }
        slotProps?.htmlInput?.onKeyDown?.(e);
      },
      onInput: (e: React.FormEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;
        if (type === "tel" || format === "numeric") {
          const max = resolvedMaxLength || 10;
          target.value = target.value.replace(/\D/g, "").slice(0, max);
        } else if (format === "aadhaar") {
          const max = resolvedMaxLength || 12;
          target.value = target.value.replace(/\D/g, "").slice(0, max);
        } else if (format === "pan") {
          const max = resolvedMaxLength || 10;
          target.value = target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, max);
        } else if (format === "uppercase") {
          target.value = target.value.toUpperCase();
        } else if (format === "alphanumeric") {
          const cleaned = target.value.replace(/[^a-zA-Z0-9]/g, "");
          target.value = resolvedMaxLength !== undefined ? cleaned.slice(0, resolvedMaxLength) : cleaned;
        }
        slotProps?.htmlInput?.onInput?.(e);
      },
      ...inputProps,
      ...slotProps?.htmlInput,
    },
    input: {
      ...InputProps,
      ...(isPassword
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
                    color: showPassword ? "primary.main" : "text.secondary",
                    mr: 0.5,
                    "&:hover": { color: "primary.main", background: "transparent" },
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
          }
        : {}),
      ...slotProps?.input,
    },

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
          paper: {
            sx: {
              maxHeight: { xs: "184px !important", sm: "176px !important" },
              maxWidth: "calc(100vw - 32px)",
              borderRadius: "12px",
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.05)",
              overflowY: "auto",
              scrollbarWidth: "thin",
              scrollbarColor: "divider transparent",
              "&::-webkit-scrollbar": { width: "5px" },
              "&::-webkit-scrollbar-track": { background: "transparent" },
              "&::-webkit-scrollbar-thumb": { backgroundColor: "divider", borderRadius: "10px" },
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
                color: "text.primary",
                "&:hover": { backgroundColor: "action.hover", color: "text.primary" },
                "&.Mui-selected": { backgroundColor: "primary.lighter", color: "primary.main", fontWeight: 600 },
              },
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
            backgroundColor: "background.paper",
            fontSize: "14px",
            color: "text.primary",
            width: "100%",
            boxSizing: "border-box",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            "& fieldset": {
              borderColor: "divider",
              borderWidth: "1.5px",
            },
            "&:hover fieldset": {
              borderColor: "neutral.300",
            },
            "&.Mui-focused": {
              backgroundColor: "background.paper",
              "& fieldset": {
                borderColor: "primary.main",
                borderWidth: "2px",
              },
              boxShadow: (theme: any) => `0 0 0 3px ${alpha(theme.palette.primary.main, 0.12)}`,
            },
          },
          "& .MuiOutlinedInput-input": {
            py: multiline ? "10px" : "8px",
            px: "14px",
            pr: select ? "42px !important" : "14px",
            fontSize: "14px",
            color: "text.primary",
            boxSizing: "border-box",
            overflow: "hidden !important",
            textOverflow: "ellipsis !important",
            whiteSpace: "nowrap !important",
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
                  backgroundColor: "primary.lighter",
                },
              },
            },
            "&:-webkit-autofill, &:-webkit-autofill:hover, &:-webkit-autofill:focus, &:-webkit-autofill:active": {
              WebkitBoxShadow: (theme: any) => `0 0 0 1000px ${theme.palette.background.paper} inset !important`,
              WebkitTextFillColor: "currentColor !important",
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
            display: "block !important",
            py: "8px !important",
            pl: "14px !important",
            pr: "42px !important",
            minHeight: "22px !important",
            boxSizing: "border-box !important",
            overflow: "hidden !important",
            textOverflow: "ellipsis !important",
            whiteSpace: "nowrap !important",
            width: "100% !important",
          },
          "& .MuiSelect-icon": {
            right: "10px !important",
            color: "#64748B",
            pointerEvents: "none",
          },
          ...sx,
        };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (format && e.target) {
      const target = e.target as HTMLInputElement;
      if (format === "pan") {
        const max = resolvedMaxLength || 10;
        target.value = target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, max);
      } else if (format === "aadhaar") {
        const max = resolvedMaxLength || 12;
        target.value = target.value.replace(/\D/g, "").slice(0, max);
      } else if (format === "uppercase") {
        target.value = target.value.toUpperCase();
      } else if (format === "numeric") {
        const max = resolvedMaxLength;
        const cleaned = target.value.replace(/\D/g, "");
        target.value = max !== undefined ? cleaned.slice(0, max) : cleaned;
      } else if (format === "alphanumeric") {
        const cleaned = target.value.replace(/[^a-zA-Z0-9]/g, "");
        target.value = resolvedMaxLength !== undefined ? cleaned.slice(0, resolvedMaxLength) : cleaned;
      }
    }
    onChange?.(e);
  };

  const extraProps: any = {};
  if (value !== undefined) {
    extraProps.value = value ?? "";
  } else if (select) {
    extraProps.defaultValue = "";
  }
  if (onChange !== undefined) {
    extraProps.onChange = handleChange;
  }
  if (onBlur !== undefined) {
    extraProps.onBlur = onBlur;
  }

  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      {label && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, mb: 0.6 }}>
          <Typography
            component="span"
            sx={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#334155",
            }}
          >
            {label} {required && <span style={{ color: "#EF4444" }}>*</span>}
          </Typography>
          {tooltip && (
            <Tooltip title={tooltip} arrow placement="top">
              <InfoOutlinedIcon
                sx={{
                  fontSize: 15,
                  color: "text.secondary",
                  cursor: "pointer",
                  transition: "color 0.2s ease",
                  "&:hover": { color: "primary.main" },
                }}
              />
            </Tooltip>
          )}
        </Box>
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