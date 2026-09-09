import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import StatusChip from "../../../components/common/StatusChip";
import PrimaryButton from "../../../components/button/PrimaryButton";
import {
  SALARY_COMPONENTS_MOCK_DATA,
  type SalaryComponentItem,
} from "../mock/payroll-data";

interface SalaryComponentsContentProps {
  data?: SalaryComponentItem[];
}

export function SalaryComponentsContent({
  data = SALARY_COMPONENTS_MOCK_DATA,
}: SalaryComponentsContentProps) {
  const components = data ?? [];

  return (
    <Box sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
      {/* 1. Top Header Bar */}
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
          Salary Components
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

      {/* 2. Subheader & Action Row */}
      <Box
        sx={{
          display: "flex",
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          mb: 3,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
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
              mb: 1,
            }}
          >
            GET/POST /payroll/components
          </Box>
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              lineHeight: 1.5,
            }}
          >
            Salary heads used across all structure blueprints — earnings and deductions, statutory or custom.
          </Typography>
        </Box>

        <Box sx={{ width: { xs: "100%", sm: "auto" }, flexShrink: 0 }}>
          <PrimaryButton>
            Add Component +
          </PrimaryButton>
        </Box>
      </Box>

      {/* 3. Master Data Table */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.paper",
          overflowX: "auto",
        }}
      >
        <Table sx={{ minWidth: 750 }} aria-label="salary components table">
          <TableHead>
            <TableRow sx={{ backgroundColor: "action.hover" }}>
              <TableCell
                sx={{
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  color: "text.secondary",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  py: 1.75,
                }}
              >
                Code
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  color: "text.secondary",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  py: 1.75,
                }}
              >
                Name
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  color: "text.secondary",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  py: 1.75,
                }}
              >
                Type
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  color: "text.secondary",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  py: 1.75,
                }}
              >
                Category
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  color: "text.secondary",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  py: 1.75,
                }}
              >
                Calculation
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  color: "text.secondary",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  py: 1.75,
                }}
              >
                Flags
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {components.map((row) => (
              <TableRow
                key={row?.id}
                sx={{
                  "&:last-child td, &:last-child th": { border: 0 },
                  "&:hover": { backgroundColor: "action.hover" },
                }}
              >
                <TableCell
                  sx={{
                    fontFamily: "monospace",
                    fontWeight: 600,
                    fontSize: "0.8125rem",
                    color: "text.primary",
                    py: 1.75,
                    borderBottomColor: "divider",
                  }}
                >
                  {row?.code}
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 500,
                    fontSize: "0.875rem",
                    color: "text.primary",
                    py: 1.75,
                    borderBottomColor: "divider",
                  }}
                >
                  {row?.name}
                </TableCell>
                <TableCell
                  sx={{
                    py: 1.75,
                    borderBottomColor: "divider",
                  }}
                >
                  <StatusChip
                    variant="outlined"
                    label={row?.type}
                    sx={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      height: 22,
                      borderColor: row?.type === "DEDUCTION" ? "error.main" : "error.light",
                      color: "error.main",
                      backgroundColor: "transparent",
                    }}
                  />
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 500,
                    fontSize: "0.8125rem",
                    color: "text.secondary",
                    textTransform: "uppercase",
                    py: 1.75,
                    borderBottomColor: "divider",
                  }}
                >
                  {row?.category}
                </TableCell>
                <TableCell
                  sx={{
                    fontFamily: "monospace",
                    fontWeight: 500,
                    fontSize: "0.8125rem",
                    color: "text.secondary",
                    py: 1.75,
                    borderBottomColor: "divider",
                  }}
                >
                  {row?.calculation}
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 500,
                    fontSize: "0.8125rem",
                    color: "text.secondary",
                    py: 1.75,
                    borderBottomColor: "divider",
                  }}
                >
                  {row?.flags}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default SalaryComponentsContent;
