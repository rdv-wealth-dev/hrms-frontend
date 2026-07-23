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
    <TextField
      {...registration}
      label={label}
      select
      error={!!error}
      helperText={error}
      fullWidth
      defaultValue=""
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
  );
}

export default CountryCodeSelect;