import { useState, useMemo, useRef } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Popover from "@mui/material/Popover";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SearchIcon from "@mui/icons-material/Search";
import type { UseFormRegisterReturn, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { countries, type CountryData } from "../../utils/country-data";

// Helper to generate native flag emojis dynamically from ISO 2-letter codes
export function getFlagEmoji(countryCode: string): string {
  if (!countryCode) return "";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  try {
    return String.fromCodePoint(...codePoints);
  } catch (error) {
    console.error("Failed to generate flag emoji for:", countryCode, error);
    return "";
  }
}

type PhoneInputProps = {
  label?: string;
  phoneRegistration?: UseFormRegisterReturn;
  countryCodeRegistration?: UseFormRegisterReturn;
  phoneError?: string;
  countryCodeError?: string;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
  disabled?: boolean;
  required?: boolean;
};

export default function PhoneInput({
  label = "Mobile Number",
  phoneRegistration,
  countryCodeRegistration,
  phoneError,
  countryCodeError,
  setValue,
  watch,
  disabled = false,
  required = false,
}: PhoneInputProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Watch countryCode form state to dynamically update UI flag
  const currentCountryCode = countryCodeRegistration?.name
    ? watch(countryCodeRegistration.name)
    : "IN";

  // Resolve current active country object with fallbacks
  const activeCountry = useMemo(() => {
    const code = currentCountryCode || "IN";
    return (
      countries.find((c) => c.code === code.toUpperCase()) ||
      countries.find((c) => c.code === "IN") ||
      countries[0]
    );
  }, [currentCountryCode]);

  const handleOpenDropdown = () => {
    if (disabled) return;
    setIsMenuOpen(true);
  };

  const handleCloseDropdown = () => {
    setIsMenuOpen(false);
    setSearchQuery("");
  };

  const handleSelectCountry = (country: CountryData) => {
    if (countryCodeRegistration?.name && setValue) {
      setValue(countryCodeRegistration.name, country.code, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
    handleCloseDropdown();
  };

  // Efficient memoized search filter
  const filteredCountries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return countries;
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.code.toLowerCase().includes(query) ||
        c.dialCode.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const hasError = Boolean(phoneError || countryCodeError);
  const displayErrorMessage = phoneError || countryCodeError;

  return (
    <Box ref={containerRef} sx={{ width: "100%" }}>
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
        {...phoneRegistration}
        error={hasError}
        helperText={displayErrorMessage}
        fullWidth
        disabled={disabled}
        type="tel"
        variant="outlined"
        slotProps={{
          htmlInput: {
            maxLength: 15,
            autoComplete: "new-password",
            onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
              // Standard control keys
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
            },
            onInput: (e: React.FormEvent<HTMLInputElement>) => {
              const target = e.target as HTMLInputElement;
              target.value = target.value.replace(/\D/g, "");
            },
          },
          input: {
            startAdornment: (
              <InputAdornment position="start" sx={{ mr: 1 }}>
                <Box
                  onClick={handleOpenDropdown}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    cursor: disabled ? "not-allowed" : "pointer",
                    py: "6px",
                    px: "8px",
                    borderRadius: "6px",
                    transform: "translateY(-1.5px)",
                    transition: "background-color 0.15s ease",
                    "&:hover": {
                      backgroundColor: disabled ? "transparent" : "rgba(109, 93, 246, 0.08)",
                    },
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      fontSize: "16px",
                      lineHeight: 1,
                      display: "inline-flex",
                      alignItems: "center",
                      userSelect: "none",
                    }}
                  >
                    {getFlagEmoji(activeCountry?.code)}
                  </Box>
                  <KeyboardArrowDownIcon
                    sx={{
                      fontSize: 16,
                      color: "#94A3B8",
                      transition: "transform 0.15s ease",
                      transform: isMenuOpen ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  />
                </Box>
                <Box
                  sx={{
                    width: "1px",
                    height: "22px",
                    backgroundColor: "#E2E8F0",
                    mx: 0.8,
                  }}
                />
              </InputAdornment>
            ),
          },
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            minHeight: 40,
            borderRadius: "12px",
            backgroundColor: "#FFFFFF",
            fontSize: "14px",
            color: "#0F172A",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            paddingLeft: "8px",
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
            py: "8px",
            px: "4px",
            fontSize: "14px",
            color: "#0F172A",
            boxSizing: "border-box",
            "&:-webkit-autofill, &:-webkit-autofill:hover, &:-webkit-autofill:focus, &:-webkit-autofill:active": {
              WebkitBoxShadow: "0 0 0 1000px #FFFFFF inset !important",
              WebkitTextFillColor: "#0F172A !important",
              borderRadius: "12px",
            },
          },
          "& .MuiInputBase-input::placeholder": {
            color: "#94A3B8",
            opacity: 1,
            fontSize: "13.5px",
            fontWeight: 400,
          },
        }}
      />

      <Popover
        open={isMenuOpen}
        anchorEl={containerRef.current}
        onClose={handleCloseDropdown}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: "transparent",
            },
          },
          paper: {
            sx: {
              mt: 1,
              width: 260,
              maxHeight: 250,
              borderRadius: "12px",
              border: "1px solid #E2E8F0",
              boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.05)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            },
          },
        }}
      >
        {/* Search Header */}
        <Box sx={{ p: 1.5, borderBottom: "1px solid #F1F5F9", flexShrink: 0 }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18, color: "#94A3B8" }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                height: 36,
                fontSize: "13px",
                "& fieldset": {
                  borderColor: "#E2E8F0",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#6D5DF6",
                  borderWidth: "1.5px",
                },
              },
            }}
          />
        </Box>

        {/* Scrollable list */}
        <Box
          sx={{
            flexGrow: 1,
            maxHeight: 170,
            overflowY: "auto",
            py: 1,
            scrollbarWidth: "thin",
            scrollbarColor: "#CBD5E1 transparent",
            "&::-webkit-scrollbar": { width: "5px" },
            "&::-webkit-scrollbar-track": { background: "transparent" },
            "&::-webkit-scrollbar-thumb": { background: "#CBD5E1", borderRadius: "10px" },
            "&::-webkit-scrollbar-thumb:hover": { background: "#94A3B8" },
          }}
        >
          <MenuList sx={{ p: 0 }}>
            {filteredCountries.map((country) => (
              <MenuItem
                key={country.code}
                selected={country.code === activeCountry?.code}
                onClick={() => handleSelectCountry(country)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  py: 0.8,
                  px: 1.8,
                  fontSize: "13.5px",
                  borderRadius: "6px",
                  mx: 1,
                  my: 0.2,
                  color: "#334155",
                  "&:hover": {
                    backgroundColor: "#F1F5F9",
                    color: "#0F172A",
                  },
                  "&.Mui-selected": {
                    backgroundColor: "#EEF2FF",
                    color: "#4F46E5",
                    fontWeight: 600,
                    "&:hover": {
                      backgroundColor: "#E0E7FF",
                    },
                  },
                }}
              >
                <Box
                  component="span"
                  sx={{
                    fontSize: "20px",
                    lineHeight: 1,
                    display: "inline-block",
                    mr: 0.5,
                    userSelect: "none",
                  }}
                >
                  {getFlagEmoji(country.code)}
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: "inherit",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {country.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748B" }}>
                    {country.code} ({country.dialCode})
                  </Typography>
                </Box>
              </MenuItem>
            ))}
            {filteredCountries.length === 0 && (
              <Box
                sx={{
                  p: 3,
                  textAlign: "center",
                  color: "#94A3B8",
                  fontSize: "13px",
                }}
              >
                No countries found
              </Box>
            )}
          </MenuList>
        </Box>
      </Popover>
    </Box>
  );
}
