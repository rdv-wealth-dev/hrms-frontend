import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import { alpha, type SxProps, type Theme } from "@mui/material/styles";

export interface TagInputProps {
  label?: string;
  placeholder?: string;
  tags?: string[];
  onChange?: (tags: string[]) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  maxTags?: number;
  sx?: SxProps<Theme>;
}

export function TagInput({
  label,
  placeholder = "Type tag and press Enter...",
  tags = [],
  onChange,
  error,
  required = false,
  disabled = false,
  maxTags,
  sx,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const addTag = () => {
    const trimmed = inputValue.trim().replace(/^,+|,+$/g, "");
    if (!trimmed) return;

    if (maxTags && tags.length >= maxTags) {
      setInputValue("");
      return;
    }

    if (!tags.includes(trimmed)) {
      const updated = [...tags, trimmed];
      onChange?.(updated);
    }
    setInputValue("");
  };

  const removeTag = (indexToRemove: number) => {
    if (disabled) return;
    const updated = tags.filter((_, idx) => idx !== indexToRemove);
    onChange?.(updated);
  };

  return (
    <Box sx={{ width: "100%", ...sx }}>
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

      <Box
        sx={{
          minHeight: 44,
          borderRadius: "12px",
          backgroundColor: disabled ? "action.hover" : "background.paper",
          border: "1.5px solid",
          borderColor: error ? "error.main" : "divider",
          p: "6px 10px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 0.8,
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            borderColor: error ? "error.main" : "neutral.300",
          },
          "&:focus-within": {
            borderColor: error ? "error.main" : "primary.main",
            boxShadow: error ? "0 0 0 3px rgba(239, 68, 68, 0.12)" : (theme: any) => `0 0 0 3px ${alpha(theme.palette.primary.main, 0.12)}`,
          },
        }}
      >
        {tags.map((tag, index) => (
          <Chip
            key={`${tag}-${index}`}
            label={tag}
            onDelete={disabled ? undefined : () => removeTag(index)}
            size="small"
            sx={{
              borderRadius: "8px",
              backgroundColor: "primary.lighter",
              color: "primary.main",
              fontWeight: 600,
              fontSize: "12px",
              border: "1px solid",
              borderColor: "divider",
              "& .MuiChip-deleteIcon": {
                color: "primary.main",
                fontSize: 16,
                "&:hover": {
                  color: "primary.dark",
                },
              },
            }}
          />
        ))}

        <TextField
          variant="standard"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={tags.length === 0 ? placeholder : "Add more..."}
          disabled={disabled || (maxTags !== undefined && tags.length >= maxTags)}
          slotProps={{
            input: {
              disableUnderline: true,
            },
          }}
          sx={{
            flex: 1,
            minWidth: 120,
            "& .MuiInputBase-input": {
              p: 0.5,
              fontSize: "13.5px",
              color: "text.primary",
              "&::placeholder": {
                color: "#94A3B8",
                opacity: 1,
              },
            },
          }}
        />
      </Box>

      {error && (
        <Typography sx={{ color: "#EF4444", fontSize: "12px", mt: 0.5, ml: 0.5 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}

export default TagInput;
