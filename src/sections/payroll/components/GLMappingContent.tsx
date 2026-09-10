import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import OutlinedInput from "@mui/material/OutlinedInput";
import Chip from "@mui/material/Chip";

import StatusChip from "../../../components/common/StatusChip";
import PrimaryButton from "../../../components/button/PrimaryButton";
import type { GLMappingData } from "../../../types/payroll.types";

const EMPTY_GL_MAPPING: GLMappingData = {
  grossSalaryAccount: "",
  netPayableAccount: "",
  tdsPayableAccount: "",
  pfPayableAccount: "",
  esiPayableAccount: "",
  ptPayableAccount: "",
};

interface GLMappingContentProps {
  data?: GLMappingData;
}

export function GLMappingContent({
  data = EMPTY_GL_MAPPING,
}: GLMappingContentProps) {
  const [formData, setFormData] = useState<GLMappingData>({
    grossSalaryAccount: data?.grossSalaryAccount ?? "",
    netPayableAccount: data?.netPayableAccount ?? "",
    tdsPayableAccount: data?.tdsPayableAccount ?? "",
    pfPayableAccount: data?.pfPayableAccount ?? "",
    esiPayableAccount: data?.esiPayableAccount ?? "",
    ptPayableAccount: data?.ptPayableAccount ?? "",
  });

  const handleChange = (field: keyof GLMappingData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const fields: { label: string; key: keyof GLMappingData; placeholder: string }[] = [
    { label: "Gross Salary Expense Account", key: "grossSalaryAccount", placeholder: "e.g. 5001 - Salary Expense" },
    { label: "Net Payable Liability Account", key: "netPayableAccount", placeholder: "e.g. 2001 - Net Pay Payable" },
    { label: "TDS Payable Liability Account", key: "tdsPayableAccount", placeholder: "e.g. 2002 - TDS Payable" },
    { label: "PF Payable Liability Account", key: "pfPayableAccount", placeholder: "e.g. 2003 - Provident Fund Payable" },
    { label: "ESI Payable Liability Account", key: "esiPayableAccount", placeholder: "e.g. 2004 - ESI Payable" },
    { label: "PT Payable Liability Account", key: "ptPayableAccount", placeholder: "e.g. 2005 - Professional Tax Payable" },
  ];

  return (
    <Box sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
      {/* 1. Header Bar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
          pb: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: "text.primary",
              letterSpacing: "-0.3px",
            }}
          >
            General Ledger Mapping
          </Typography>
          <Chip
            label="Coming Soon"
            size="small"
            sx={{
              height: 22,
              fontSize: "0.75rem",
              fontWeight: 700,
              backgroundColor: "rgba(99, 102, 241, 0.12)",
              color: "#4F46E5",
              border: "1px solid rgba(99, 102, 241, 0.3)",
            }}
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <StatusChip
            variant="outlined"
            label="Aug 2026 · DRAFT"
            sx={{
              fontWeight: 700,
              fontSize: "0.8125rem",
              borderColor: "error.main",
              color: "error.main",
              backgroundColor: "transparent",
            }}
          />
        </Box>
      </Box>

      {/* 2. Endpoint Pill */}
      <Box sx={{ mb: 2.5 }}>
        <Box
          component="span"
          sx={{
            display: "inline-block",
            px: 1,
            py: 0.25,
            borderRadius: 1,
            border: "1px solid",
            borderColor: "error.main",
            color: "error.main",
            fontFamily: "monospace",
            fontSize: "0.75rem",
            fontWeight: 600,
          }}
        >
          POST /payroll/gl-config
        </Box>
      </Box>

      {/* 3. Form Card */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3 },
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.paper",
          maxWidth: { xs: "100%", md: 560 },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {fields.map(({ key, label, placeholder }) => (
            <Box key={key}>
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  color: "text.secondary",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  mb: 0.5,
                }}
              >
                {label}
              </Typography>
              <OutlinedInput
                size="small"
                fullWidth
                placeholder={placeholder}
                value={formData[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                sx={{
                  height: 38,
                  borderRadius: 1,
                  fontSize: "0.875rem",
                  backgroundColor: "background.paper",
                }}
              />
            </Box>
          ))}

          {/* Action Button */}
          <Box sx={{ mt: 1 }}>
            <PrimaryButton>
              Save Mapping
            </PrimaryButton>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default GLMappingContent;
