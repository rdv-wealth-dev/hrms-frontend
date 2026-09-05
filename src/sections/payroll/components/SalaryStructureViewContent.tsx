import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";

import StatusChip from "../../../components/common/StatusChip";
import {
  SALARY_STRUCTURE_EMPLOYEES_MOCK_DATA,
  type EmployeeSalaryStructureOption,
} from "../mock/payroll-data";

interface SalaryStructureViewContentProps {
  data?: EmployeeSalaryStructureOption[];
}

export function SalaryStructureViewContent({
  data = SALARY_STRUCTURE_EMPLOYEES_MOCK_DATA,
}: SalaryStructureViewContentProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

  const selectedEmployee = data?.find((emp) => emp.id === selectedEmployeeId);

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
          Employee Salary Structure
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

      {/* 2. Selection Card */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3 },
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.paper",
          maxWidth: { xs: "100%", md: 480 },
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 700,
            color: "text.primary",
            mb: 2,
          }}
        >
          Select an employee
        </Typography>

        <Box sx={{ mb: selectedEmployee ? 3 : 0 }}>
          <Typography
            variant="caption"
            sx={{
              display: "block",
              color: "text.secondary",
              fontSize: "0.75rem",
              fontWeight: 500,
              mb: 0.75,
            }}
          >
            Employee
          </Typography>

          <Select
            size="small"
            fullWidth
            value={selectedEmployeeId}
            onChange={(e) => setSelectedEmployeeId(e.target.value)}
            displayEmpty
            renderValue={(selected) => {
              if (!selected) {
                return (
                  <Typography sx={{ color: "text.secondary", fontSize: "0.875rem" }}>
                    Choose...
                  </Typography>
                );
              }
              const emp = data?.find((item) => item.id === selected);
              return `${emp?.code ?? ""} — ${emp?.name ?? ""}`;
            }}
            sx={{
              height: 38,
              borderRadius: 1,
              fontSize: "0.875rem",
              backgroundColor: "background.paper",
            }}
          >
            <MenuItem value="">
              <Typography sx={{ color: "text.secondary", fontSize: "0.875rem" }}>
                Choose...
              </Typography>
            </MenuItem>
            {data?.map((emp) => (
              <MenuItem key={emp.id} value={emp.id}>
                {`${emp.code} — ${emp.name}`}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {/* Selected Employee Details Preview */}
        {selectedEmployee && (
          <Box
            sx={{
              pt: 2.5,
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, color: "text.primary" }}
              >
                Assigned Structure
              </Typography>
              <StatusChip
                label={selectedEmployee.structureName ?? "Structure 1"}
                variant="outlined"
                size="small"
              />
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Employee Name
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: "text.primary" }}
                >
                  {selectedEmployee.name}
                </Typography>
              </Box>

              <Divider sx={{ my: 0.5 }} />

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Annual CTC
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: "text.primary" }}
                >
                  {selectedEmployee.annualCtc ?? "—"}
                </Typography>
              </Box>

              <Divider sx={{ my: 0.5 }} />

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Monthly Gross
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: "text.primary" }}
                >
                  {selectedEmployee.monthlyGross ?? "—"}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default SalaryStructureViewContent;
