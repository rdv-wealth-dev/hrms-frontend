import { useState } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";

import StatusChip from "../../../components/common/StatusChip";
import {
  PAYSLIP_TEMPLATES_MOCK_DATA,
  type PayslipTemplateItem,
} from "../mock/payroll-data";

interface PayslipTemplatesContentProps {
  data?: PayslipTemplateItem[];
}

export function PayslipTemplatesContent({
  data = PAYSLIP_TEMPLATES_MOCK_DATA,
}: PayslipTemplatesContentProps) {
  const [templates, setTemplates] = useState<PayslipTemplateItem[]>(data ?? []);

  const handleSetDefault = (id: string) => {
    setTemplates(
      templates.map((tpl) => ({
        ...tpl,
        isDefault: tpl.id === id,
      }))
    );
  };

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
          Payslip Templates
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
          POST /payroll/payslip-templates
        </Box>
      </Box>

      {/* 3. Templates Grid */}
      <Grid container spacing={2.5}>
        {templates?.map((tpl) => (
          <Grid key={tpl.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                backgroundColor: "background.paper",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                height: "100%",
              }}
            >
              <Box>
                {/* Top Tags */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 1.5,
                  }}
                >
                  <Typography
                    sx={{
                      color: "error.main",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      letterSpacing: "0.5px",
                    }}
                  >
                    {tpl.code}
                  </Typography>

                  {tpl.isDefault && (
                    <Chip
                      size="small"
                      label="DEFAULT"
                      sx={{
                        fontSize: "0.6875rem",
                        fontWeight: 700,
                        height: 20,
                        px: 0.5,
                        backgroundColor: "action.selected",
                        color: "text.primary",
                      }}
                    />
                  )}
                </Box>

                {/* Title */}
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 700,
                    color: "text.primary",
                    mb: 1,
                    lineHeight: 1.3,
                  }}
                >
                  {tpl.title}
                </Typography>

                {/* Description */}
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    fontSize: "0.8125rem",
                    lineHeight: 1.4,
                    mb: 3,
                  }}
                >
                  {tpl.description}
                </Typography>
              </Box>

              {/* Set as Default Action */}
              <Button
                fullWidth
                variant="outlined"
                onClick={() => handleSetDefault(tpl.id)}
                sx={{
                  height: 36,
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "divider",
                  color: "text.primary",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  textTransform: "none",
                  backgroundColor: "background.paper",
                  "&:hover": {
                    backgroundColor: "action.hover",
                    borderColor: "text.secondary",
                  },
                }}
              >
                Set as Default
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default PayslipTemplatesContent;
