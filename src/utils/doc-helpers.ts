export interface DocumentDefinition {
  code: string;
  label: string;
  description: string;
  placeholder?: string;
  maxLength?: number;
  requiresNumber?: boolean;
}

export const MASTER_DOCUMENT_CATALOG: Record<string, DocumentDefinition> = {
  PAN: {
    code: "PAN",
    label: "PAN Card",
    description: "Government issued 10-character PAN card",
    placeholder: "e.g. ABCDE1234F",
    maxLength: 10,
    requiresNumber: false,
  },
  AADHAAR: {
    code: "AADHAAR",
    label: "Aadhaar Card",
    description: "Government issued 12-digit UID Aadhaar card",
    placeholder: "e.g. 123456789012",
    maxLength: 12,
    requiresNumber: false,
  },
  PASSPORT: {
    code: "PASSPORT",
    label: "Passport",
    description: "Official passport identity document",
    placeholder: "e.g. L1234567",
    maxLength: 9,
    requiresNumber: true,
  },
  DRIVING_LICENSE: {
    code: "DRIVING_LICENSE",
    label: "Driving License",
    description: "Official motorized vehicle driver license",
    placeholder: "e.g. KA0120200001234",
    requiresNumber: true,
  },
  RESUME: {
    code: "RESUME",
    label: "Resume / CV",
    description: "Professional career summary document",
    requiresNumber: false,
  },
  DEGREE: {
    code: "DEGREE",
    label: "Degree Certificate",
    description: "Academic qualification diploma certificate",
    requiresNumber: false,
  },
  EXPERIENCE: {
    code: "EXPERIENCE",
    label: "Experience Certificate",
    description: "Formal work experience letter from previous employer",
    requiresNumber: false,
  },
  OTHER: {
    code: "OTHER",
    label: "Other Document",
    description: "Additional supporting identification document",
    requiresNumber: false,
  },
};

/**
 * Returns document definition for a given code, falling back to a generic definition.
 */
export function getDocumentDefinition(code: string): DocumentDefinition {
  const upper = code.toUpperCase();
  if (MASTER_DOCUMENT_CATALOG[upper]) {
    return MASTER_DOCUMENT_CATALOG[upper];
  }
  return {
    code: upper,
    label: code.replace(/_/g, " ").toUpperCase(),
    description: "Official organization requirement document",
    requiresNumber: false,
  };
}
