import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import OutlinedInput from "@mui/material/OutlinedInput";
import Button from "@mui/material/Button";

import StatusChip from "../../../components/common/StatusChip";
import {
  PROFESSIONAL_TAX_SLABS_MOCK_DATA,
  type PtStateGroup,
} from "../mock/payroll-data";

interface ProfessionalTaxSlabsContentProps {
  data?: PtStateGroup[];
}

export function ProfessionalTaxSlabsContent({
  data = PROFESSIONAL_TAX_SLABS_MOCK_DATA,
}: ProfessionalTaxSlabsContentProps) {
  const stateGroups = data ?? [];

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
          Professional Tax Slabs
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
          POST /payroll/config/pt
        </Box>
      </Box>

      {/* 3. State Slabs Cards */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: { xs: "100%", md: 800 } }}>
        {stateGroups.map((group) => (
          <Paper
            key={group?.id}
            elevation={0}
            sx={{
              p: { xs: 2.5, sm: 3 },
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              backgroundColor: "background.paper",
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: "text.primary",
                mb: 2.5,
              }}
            >
              {`${group?.stateName ?? ""} (${group?.stateCode ?? ""})`.trim()}
            </Typography>

            {/* Slabs Table */}
            <TableContainer sx={{ overflowX: "auto", mb: 3 }}>
              <Table size="small" aria-label="professional tax slabs table">
                <TableHead>
                  <TableRow sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
                    <TableCell
                      sx={{
                        pl: 0,
                        py: 1.5,
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        color: "text.secondary",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        borderBottom: "none",
                      }}
                    >
                      Min Monthly Salary
                    </TableCell>
                    <TableCell
                      sx={{
                        py: 1.5,
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        color: "text.secondary",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        borderBottom: "none",
                      }}
                    >
                      Max Monthly Salary
                    </TableCell>
                    <TableCell
                      sx={{
                        pr: 0,
                        py: 1.5,
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        color: "text.secondary",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        borderBottom: "none",
                      }}
                    >
                      PT Amount
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {group?.slabs?.map((slab) => (
                    <TableRow
                      key={slab?.id}
                      sx={{
                        "&:hover": { backgroundColor: "action.hover" },
                      }}
                    >
                      <TableCell
                        sx={{
                          pl: 0,
                          py: 1.75,
                          fontWeight: 500,
                          fontSize: "0.875rem",
                          color: "text.primary",
                          borderBottomColor: "divider",
                        }}
                      >
                        {slab?.minSalary}
                      </TableCell>
                      <TableCell
                        sx={{
                          py: 1.75,
                          fontWeight: 500,
                          fontSize: "0.875rem",
                          color: "text.primary",
                          borderBottomColor: "divider",
                        }}
                      >
                        {slab?.maxSalary}
                      </TableCell>
                      <TableCell
                        sx={{
                          pr: 0,
                          py: 1.75,
                          fontWeight: 500,
                          fontSize: "0.875rem",
                          color: "text.primary",
                          borderBottomColor: "divider",
                        }}
                      >
                        {slab?.ptAmount}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Inline Add Slab Form Row */}
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-end",
                flexWrap: { xs: "wrap", sm: "nowrap" },
                gap: 2,
                pt: 1,
              }}
            >
              <Box sx={{ flex: { xs: "1 1 calc(50% - 8px)", sm: 1 } }}>
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    fontWeight: 500,
                    color: "text.secondary",
                    fontSize: "0.75rem",
                    mb: 0.75,
                  }}
                >
                  Min
                </Typography>
                <OutlinedInput
                  size="small"
                  fullWidth
                  placeholder=""
                  sx={{
                    height: 38,
                    borderRadius: 1.5,
                    fontSize: "0.875rem",
                    backgroundColor: "background.paper",
                  }}
                />
              </Box>

              <Box sx={{ flex: { xs: "1 1 calc(50% - 8px)", sm: 1 } }}>
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    fontWeight: 500,
                    color: "text.secondary",
                    fontSize: "0.75rem",
                    mb: 0.75,
                  }}
                >
                  Max
                </Typography>
                <OutlinedInput
                  size="small"
                  fullWidth
                  placeholder=""
                  sx={{
                    height: 38,
                    borderRadius: 1.5,
                    fontSize: "0.875rem",
                    backgroundColor: "background.paper",
                  }}
                />
              </Box>

              <Box sx={{ flex: { xs: "1 1 calc(50% - 8px)", sm: 1 } }}>
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    fontWeight: 500,
                    color: "text.secondary",
                    fontSize: "0.75rem",
                    mb: 0.75,
                  }}
                >
                  PT Amount
                </Typography>
                <OutlinedInput
                  size="small"
                  fullWidth
                  placeholder=""
                  sx={{
                    height: 38,
                    borderRadius: 1.5,
                    fontSize: "0.875rem",
                    backgroundColor: "background.paper",
                  }}
                />
              </Box>

              <Box sx={{ flex: { xs: "1 1 100%", sm: "none" } }}>
                <Button
                  variant="outlined"
                  sx={{
                    height: 38,
                    width: { xs: "100%", sm: "auto" },
                    px: 3,
                    borderRadius: 1.5,
                    borderColor: "divider",
                    color: "text.primary",
                    fontWeight: 600,
                    fontSize: "0.8125rem",
                    textTransform: "none",
                    whiteSpace: "nowrap",
                    "&:hover": {
                      borderColor: "text.secondary",
                      backgroundColor: "action.hover",
                    },
                  }}
                >
                  Add Slab
                </Button>
              </Box>
            </Box>
          </Paper>
        ))}

        {/* Footnote */}
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            fontSize: "0.75rem",
            lineHeight: 1.5,
          }}
        >
          Single-state setup shown (Maharashtra). Multi-state orgs add one card per state.
        </Typography>
      </Box>
    </Box>
  );
}

export default ProfessionalTaxSlabsContent;
