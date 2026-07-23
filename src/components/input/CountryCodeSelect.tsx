import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import type { UseFormRegisterReturn } from "react-hook-form";

import { countryCodes } from "../../utils/country-codes";

type CountryCodeSelectProps = {
  label: string;
  registration?: UseFormRegisterReturn;
  error?: string;
};

function CountryCodeSelect({
  label,
  registration,
  error,
}: CountryCodeSelectProps) {
  return (
    <Box>
      <Typography
        variant="body2"
        sx={{
          mb: { xs: 0.4, sm: 0.5 },
          fontSize: { xs: "13px", sm: "13.5px" },
          fontWeight: 500,
          color: "#374151",
        }}
      >
        {label}
      </Typography>

      <TextField
        {...registration}
        select
        error={!!error}
        helperText={error}
        fullWidth
        defaultValue=""
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "10px",
            backgroundColor: "#FFFFFF",
            height: { xs: "42px", sm: "46px" },

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
            fontSize: { xs: "13.5px", sm: "14px" },
            color: "#111827",
          },

          "& .MuiFormHelperText-root": {
            marginLeft: 0,
            marginTop: "4px",
            fontSize: "12px",
          },
        }}
      >
        <MenuItem value="" disabled>
          Select country
        </MenuItem>
        {countryCodes.map((country) => (
          <MenuItem key={country.code} value={country.code}>
            {country.label}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
}

export default CountryCodeSelect;