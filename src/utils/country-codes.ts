export interface CountryCodeOption {
  code: string;       // alpha-2, e.g. "IN" — sent to backend
  dialCode: string;    // e.g. "+91" — display only
  label: string;        // e.g. "IN (+91)"
}

export const countryCodes: CountryCodeOption[] = [
  { code: "IN", dialCode: "+91", label: "IN (+91)" },
  { code: "US", dialCode: "+1", label: "US (+1)" },
  { code: "GB", dialCode: "+44", label: "GB (+44)" },
  { code: "AU", dialCode: "+61", label: "AU (+61)" },
  { code: "CA", dialCode: "+1", label: "CA (+1)" },
  { code: "AE", dialCode: "+971", label: "AE (+971)" },
  { code: "SG", dialCode: "+65", label: "SG (+65)" },
  { code: "DE", dialCode: "+49", label: "DE (+49)" },
  { code: "FR", dialCode: "+33", label: "FR (+33)" },
  { code: "JP", dialCode: "+81", label: "JP (+81)" },
];