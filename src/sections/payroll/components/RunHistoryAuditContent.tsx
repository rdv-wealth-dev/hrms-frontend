import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Divider from "@mui/material/Divider";

import type { RunHistoryAuditData } from "../../../types/payroll.types";

const EMPTY_RUN_HISTORY_DATA: RunHistoryAuditData = {
  periodLabel: "Aug 2026",
  periodStatus: "DRAFT",
  runHistory: [],
  auditTrail: [],
};

// ---------- helpers ----------
function statusChipSx(status: string) {
  if (status === "PAID")
    return {
      color: "#059669",
      borderColor: "#059669",
      backgroundColor: "#ECFDF5",
      fontWeight: 700,
      fontSize: "12px",
    };
  if (status === "APPROVED")
    return {
      color: "#2563EB",
      borderColor: "#2563EB",
      backgroundColor: "#EFF6FF",
      fontWeight: 700,
      fontSize: "12px",
    };
  // DRAFT
  return {
    color: "#D97706",
    borderColor: "#D97706",
    backgroundColor: "#FFFBEB",
    fontWeight: 700,
    fontSize: "12px",
  };
}

const TABLE_HEAD_SX = {
  fontWeight: 700,
  fontSize: "12px",
  color: "text.secondary",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
};

export default function RunHistoryAuditContent() {
  const data = EMPTY_RUN_HISTORY_DATA;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, p: { xs: 2, md: 3 } }}>
      {/* Page Header Row */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary" }}>
          Run History &amp; Audit Trail
        </Typography>

        <Chip
          label={`${data?.periodLabel} \u00b7 ${data?.periodStatus}`}
          size="small"
          variant="outlined"
          sx={{
            fontWeight: 600,
            borderColor: "warning.main",
            color: "warning.dark",
            backgroundColor: "warning.lighter",
            px: 1,
            py: 0.5,
          }}
        />
      </Box>

      {/* Run History Table */}
      <Card
        sx={{
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.paper",
          overflow: "hidden",
        }}
      >
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table size="medium" sx={{ minWidth: 750 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "action.hover" }}>
                <TableCell sx={TABLE_HEAD_SX}>Period</TableCell>
                <TableCell sx={TABLE_HEAD_SX}>Status</TableCell>
                <TableCell sx={TABLE_HEAD_SX}>Employees</TableCell>
                <TableCell sx={TABLE_HEAD_SX}>Gross</TableCell>
                <TableCell sx={TABLE_HEAD_SX}>Deductions</TableCell>
                <TableCell sx={TABLE_HEAD_SX}>Net</TableCell>
                <TableCell sx={TABLE_HEAD_SX}>Approved</TableCell>
                <TableCell sx={TABLE_HEAD_SX}>Paid</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {data?.runHistory?.map((row) => (
                <TableRow
                  key={row?.id}
                  hover
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell sx={{ fontWeight: 600, fontSize: "14px", color: "text.primary" }}>
                    {row?.period}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={row?.status}
                      size="small"
                      variant="outlined"
                      sx={statusChipSx(row?.status)}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500, fontSize: "14px", color: "text.primary" }}>
                    {row?.employees}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500, fontSize: "14px", color: "text.primary" }}>
                    {row?.gross}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500, fontSize: "14px", color: "text.primary" }}>
                    {row?.deductions}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: "14px", color: "text.primary" }}>
                    {row?.net}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: "13.5px",
                      color: row?.approved ? "text.primary" : "text.disabled",
                    }}
                  >
                    {row?.approved ?? "\u2014"}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: "13.5px",
                      color: row?.paid ? "text.primary" : "text.disabled",
                    }}
                  >
                    {row?.paid ?? "\u2014"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Audit Trail Section */}
      <Card
        sx={{
          p: { xs: 2.5, md: 3 },
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.paper",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary", mb: 2 }}>
          Audit Trail
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column" }}>
          {data?.auditTrail?.map((item, index) => (
            <Box key={item?.id}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: { xs: "flex-start", sm: "center" },
                  justifyContent: "space-between",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: { xs: 0.5, sm: 2 },
                  py: 1.75,
                }}
              >
                {/* Left: Action + Actor */}
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: "primary.main",
                      fontSize: "14px",
                      lineHeight: 1.5,
                    }}
                  >
                    {item?.action}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary", fontWeight: 500, fontSize: "12.5px" }}
                  >
                    {item?.actor}
                  </Typography>
                </Box>

                {/* Right: Timestamp */}
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    fontWeight: 500,
                    fontSize: "12.5px",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  {item?.timestamp}
                </Typography>
              </Box>

              {index < (data?.auditTrail?.length ?? 0) - 1 && (
                <Divider sx={{ borderColor: "divider" }} />
              )}
            </Box>
          ))}
        </Box>
      </Card>
    </Box>
  );
}
