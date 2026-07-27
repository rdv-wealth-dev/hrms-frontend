import MenuItem from "@mui/material/MenuItem";
import type { UseFormRegisterReturn } from "react-hook-form";

import TextInput from "./TextInput";
import { countryCodes } from "../../utils/country-codes";

type CountryCodeSelectProps = {
  label?: string;
  registration?: UseFormRegisterReturn;
  error?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  sx?: any;
};

function CountryCodeSelect({
  label = "Country Code",
  registration,
  error,
  value,
  onChange,
  sx,
}: CountryCodeSelectProps) {
  return (
    <TextInput
      select
      label={label}
      registration={registration}
      value={value}
      onChange={onChange}
      error={error}
      sx={sx}
    >
      <MenuItem value="" disabled>
        Select country code
      </MenuItem>
      {countryCodes.map((country) => (
        <MenuItem key={country.code} value={country.code}>
          {country.code} ({country.label})
        </MenuItem>
      ))}
    </TextInput>
  );
}

export default CountryCodeSelect;