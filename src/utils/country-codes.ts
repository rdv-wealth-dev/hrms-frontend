export interface CountryCodeOption {
  code: string;       // alpha-2, e.g. "IN" — sent to backend and used for per-country phone validation
  dialCode: string;    // e.g. "+91" — display only
  label: string;        // e.g. "India (+91)"
}

export const countryCodes: CountryCodeOption[] = [
  { code: "AE", dialCode: "+971", label: "UAE (+971)" },
  { code: "AU", dialCode: "+61",  label: "Australia (+61)" },
  { code: "BD", dialCode: "+880", label: "Bangladesh (+880)" },
  { code: "CA", dialCode: "+1",   label: "Canada (+1)" },
  { code: "DE", dialCode: "+49",  label: "Germany (+49)" },
  { code: "FR", dialCode: "+33",  label: "France (+33)" },
  { code: "GB", dialCode: "+44",  label: "UK (+44)" },
  { code: "IN", dialCode: "+91",  label: "India (+91)" },
  { code: "JP", dialCode: "+81",  label: "Japan (+81)" },
  { code: "NL", dialCode: "+31",  label: "Netherlands (+31)" },
  { code: "NO", dialCode: "+47",  label: "Norway (+47)" },
  { code: "PH", dialCode: "+63",  label: "Philippines (+63)" },
  { code: "PK", dialCode: "+92",  label: "Pakistan (+92)" },
  { code: "SA", dialCode: "+966", label: "Saudi Arabia (+966)" },
  { code: "SE", dialCode: "+46",  label: "Sweden (+46)" },
  { code: "SG", dialCode: "+65",  label: "Singapore (+65)" },
  { code: "US", dialCode: "+1",   label: "USA (+1)" },
  { code: "ZA", dialCode: "+27",  label: "South Africa (+27)" },
];