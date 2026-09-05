import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Checkbox from "@mui/material/Checkbox";

import StatusChip from "../../../components/common/StatusChip";
import PrimaryButton from "../../../components/button/PrimaryButton";
import {
  EMPLOYEE_STRUCTURE_ASSIGNMENTS_MOCK_DATA,
  type EmployeeStructureAssignmentItem,
} from "../mock/payroll-data";

interface StructureAssignmentContentProps {
  data?: EmployeeStructureAssignmentItem[];
}

export function StructureAssignmentContent({
  data = EMPLOYEE_STRUCTURE_ASSIGNMENTS_MOCK_DATA,
}: StructureAssignmentContentProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const allIds = data?.map((item) => item.id) ?? [];
  const isAllSelected = allIds.length > 0 && selectedIds.length === allIds.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < allIds.length;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds([...allIds]);
    }
  };

  const handleToggleOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
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
          Structure Assignment
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

      {/* 2. Action Bar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
          mb: 2.5,
        }}
      >
        {/* Endpoint Pill */}
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
          POST /payroll/structures/assign-bulk
        </Box>

        {/* Assign Structure Button */}
        <Box sx={{ minWidth: 190 }}>
          <PrimaryButton>
            {`Assign Structure ( ${selectedIds.length} )`}
          </PrimaryButton>
        </Box>
      </Box>

      {/* 3. Table */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.paper",
          overflowX: "auto",
        }}
      >
        <Table sx={{ minWidth: 850 }} aria-label="structure assignment table">
          <TableHead>
            <TableRow sx={{ backgroundColor: "action.hover" }}>
              <TableCell padding="checkbox" sx={{ pl: 2, py: 1.5 }}>
                <Checkbox
                  size="small"
                  indeterminate={isIndeterminate}
                  checked={isAllSelected}
                  onChange={handleToggleSelectAll}
                  aria-label="select all employees"
                />
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  color: "text.secondary",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  py: 1.5,
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
                  py: 1.5,
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
                  py: 1.5,
                }}
              >
                Department
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  color: "text.secondary",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  py: 1.5,
                }}
              >
                Structure
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  color: "text.secondary",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  py: 1.5,
                }}
              >
                Annual CTC
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  color: "text.secondary",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  py: 1.5,
                }}
              >
                Status
              </TableCell>
              <TableCell sx={{ py: 1.5 }} />
            </TableRow>
          </TableHead>

          <TableBody>
            {data?.map((emp) => {
              const isSelected = selectedIds.includes(emp.id);

              return (
                <TableRow
                  key={emp.id}
                  hover
                  selected={isSelected}
                  sx={{
                    "&:hover": {
                      backgroundColor: "action.hover",
                    },
                  }}
                >
                  <TableCell padding="checkbox" sx={{ pl: 2, py: 1.5 }}>
                    <Checkbox
                      size="small"
                      checked={isSelected}
                      onChange={() => handleToggleOne(emp.id)}
                      aria-label={`select ${emp.name}`}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 1.5 }}>
                    <Typography
                      sx={{
                        fontSize: "0.8125rem",
                        color: "text.secondary",
                        fontFamily: "monospace",
                      }}
                    >
                      {emp.code}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 1.5 }}>
                    <Typography
                      sx={{
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        color: "text.primary",
                      }}
                    >
                      {emp.name}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 1.5 }}>
                    <Typography
                      sx={{
                        fontSize: "0.875rem",
                        color: "text.secondary",
                      }}
                    >
                      {emp.department}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 1.5 }}>
                    <Typography
                      sx={{
                        fontSize: "0.875rem",
                        color: "text.secondary",
                      }}
                    >
                      {emp.structure}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 1.5 }}>
                    <Typography
                      sx={{
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: "text.primary",
                      }}
                    >
                      {emp.annualCtc}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 1.5 }}>
                    <Typography
                      sx={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: "error.main",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {emp.status}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 1.5, textAlign: "right", pr: 3 }}>
                    <Typography
                      component="button"
                      type="button"
                      sx={{
                        background: "none",
                        border: "none",
                        p: 0,
                        cursor: "pointer",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: "error.main",
                        "&:hover": {
                          textDecoration: "underline",
                        },
                      }}
                    >
                      View
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}

export default StructureAssignmentContent;
