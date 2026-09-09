import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import OutlinedInput from "@mui/material/OutlinedInput";

import StatusChip from "../../../components/common/StatusChip";
import PrimaryButton from "../../../components/button/PrimaryButton";
import {
  GL_MAPPING_MOCK_DATA,
  type GLMappingData,
} from "../mock/payroll-data";

interface GLMappingContentProps {
  data?: GLMappingData;
}

export function GLMappingContent({
  data = GL_MAPPING_MOCK_DATA,
}: GLMappingContentProps) {
  const [formData, setFormData] = useState<GLMappingData>({
    grossSalaryAccount: data?.grossSalaryAccount ?? "5100-WAGES-EXPENSE",
    netPayableAccount: data?.netPayableAccount ?? "1100-BANK-ACCOUNT",
    tdsPayableAccount: data?.tdsPayableAccount ?? "2200-TDS-PAYABLE",
    pfPayableAccount: data?.pfPayableAccount ?? "2210-PF-PAYABLE",
    esiPayableAccount: data?.esiPayableAccount ?? "2220-ESI-PAYABLE",
    ptPayableAccount: data?.ptPayableAccount ?? "2230-PT-PAYABLE",
  });

  const handleChange = (field: keyof GLMappingData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const fields: { key: keyof GLMappingData; label: string }[] = [
    { key: "grossSalaryAccount", label: "Gross Salary Account" },
    { key: "netPayableAccount", label: "Net Payable Account" },
    { key: "tdsPayableAccount", label: "TDS Payable Account" },
    { key: "pfPayableAccount", label: "PF Payable Account" },
    { key: "esiPayableAccount", label: "ESI Payable Account" },
    { key: "ptPayableAccount", label: "PT Payable Account" },
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
          {fields.map(({ key, label }) => (
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
