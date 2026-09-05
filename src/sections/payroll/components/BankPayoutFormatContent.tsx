import { useState } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import OutlinedInput from "@mui/material/OutlinedInput";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

import StatusChip from "../../../components/common/StatusChip";
import {
  BANK_PAYOUT_FORMAT_MOCK_DATA,
  type BankPayoutFormatData,
  type BankPayoutColumnItem,
} from "../mock/payroll-data";

interface BankPayoutFormatContentProps {
  data?: BankPayoutFormatData;
}

export function BankPayoutFormatContent({
  data = BANK_PAYOUT_FORMAT_MOCK_DATA,
}: BankPayoutFormatContentProps) {
  const [columns, setColumns] = useState<BankPayoutColumnItem[]>(data?.columns ?? []);
  const [newColumnHeader, setNewColumnHeader] = useState("");
  const [newFieldSource, setNewFieldSource] = useState("");

  const handleAddColumn = () => {
    if (!newColumnHeader.trim()) return;
    const newCol: BankPayoutColumnItem = {
      id: `col-${Date.now()}`,
      index: columns.length + 1,
      columnHeader: newColumnHeader.trim(),
      fieldSource: newFieldSource.trim() || "Custom Field",
    };
    setColumns([...columns, newCol]);
    setNewColumnHeader("");
    setNewFieldSource("");
  };

  const handleRemoveColumn = (id: string) => {
    const filtered = columns.filter((col) => col.id !== id);
    const reindexed = filtered.map((col, idx) => ({
      ...col,
      index: idx + 1,
    }));
    setColumns(reindexed);
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
          Bank Payout Format
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <StatusChip
            variant="outlined"
            label={data?.activePeriodLabel ?? "Aug 2026 · DRAFT"}
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
          {data?.endpointLabel ?? "POST /payroll/bank-formats"}
        </Box>
      </Box>

      {/* 3. Format Configuration Card */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3 },
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.paper",
          maxWidth: { xs: "100%", md: 720 },
        }}
      >
        {/* Card Header */}
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              color: "text.primary",
              lineHeight: 1.3,
            }}
          >
            {data?.title ?? "Noida Branch - Kotak CMS Format"}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              display: "block",
              color: "text.secondary",
              mt: 0.25,
              fontSize: "0.8125rem",
            }}
          >
            Bank code {data?.bankCode ?? "KOTAK_NOIDA"} · delimiter {data?.delimiter ?? "','"}{" "}
            · {data?.fileExtension ?? ".csv"}
          </Typography>
        </Box>

        {/* Columns Table */}
        <Box sx={{ width: "100%", overflowX: "auto" }}>
          <Box sx={{ minWidth: 500 }}>
            {/* Table Header */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                borderBottom: "2px solid",
                borderColor: "divider",
                py: 1,
              }}
            >
              <Box sx={{ width: 44, pl: 1 }}>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, color: "text.secondary", fontSize: "0.75rem" }}
                >
                  #
                </Typography>
              </Box>
              <Box sx={{ flex: 1.2 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: "text.secondary",
                    fontSize: "0.75rem",
                    letterSpacing: "0.5px",
                  }}
                >
                  COLUMN HEADER
                </Typography>
              </Box>
              <Box sx={{ flex: 1.4 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: "text.secondary",
                    fontSize: "0.75rem",
                    letterSpacing: "0.5px",
                  }}
                >
                  FIELD SOURCE
                </Typography>
              </Box>
              <Box sx={{ width: 44, textAlign: "center" }} />
            </Box>

            {/* Table Rows */}
            {columns?.map((col) => (
              <Box
                key={col.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  py: 1.5,
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
              >
                <Box sx={{ width: 44, pl: 1 }}>
                  <Typography sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
                    {col.index}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1.2 }}>
                  <Typography sx={{ fontSize: "0.875rem", fontWeight: 500, color: "text.primary" }}>
                    {col.columnHeader}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1.4 }}>
                  <Typography sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
                    {col.fieldSource}
                  </Typography>
                </Box>
                <Box sx={{ width: 44, textAlign: "center" }}>
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveColumn(col.id)}
                    aria-label={`Remove ${col.columnHeader}`}
                    sx={{
                      color: "error.main",
                      p: 0.5,
                      "&:hover": {
                        backgroundColor: "action.hover",
                      },
                    }}
                  >
                    <CloseIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Add Column Form */}
        <Box sx={{ mt: 3, pt: 1 }}>
          <Grid container spacing={1.5} sx={{ alignItems: "flex-end" }}>
            <Grid size={{ xs: 12, sm: 4.5 }}>
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
                Column Header
              </Typography>
              <OutlinedInput
                size="small"
                fullWidth
                value={newColumnHeader}
                onChange={(e) => setNewColumnHeader(e.target.value)}
                sx={{
                  height: 38,
                  borderRadius: 1,
                  fontSize: "0.875rem",
                  backgroundColor: "background.paper",
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4.5 }}>
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
                Field Source
              </Typography>
              <OutlinedInput
                size="small"
                fullWidth
                placeholder="e.g. Employee Code"
                value={newFieldSource}
                onChange={(e) => setNewFieldSource(e.target.value)}
                sx={{
                  height: 38,
                  borderRadius: 1,
                  fontSize: "0.875rem",
                  backgroundColor: "background.paper",
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleAddColumn}
                sx={{
                  height: 38,
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
                Add Column
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
}

export default BankPayoutFormatContent;
