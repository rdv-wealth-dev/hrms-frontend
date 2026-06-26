import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";

import EmployeeCard from "../EmployeeCard";
import DepartmentHeader from "../DepartmentHeader";
import TreeConnector from "../TreeConnector";

import type { EmployeeNode } from "../types";

type TreeNodeProps = {
  employee: EmployeeNode;
};

function TreeNode({ employee }: TreeNodeProps) {
  const assistant = employee.children?.[0];
  const departments = assistant?.children ?? [];

  return (
    <Stack sx={{ alignItems: "center" }}>
      {/* CEO */}
      <Paper elevation={2} sx={{ width: 300, p: 2, borderRadius: 2 }}>
        <EmployeeCard employee={employee} />
      </Paper>

      {/* Vertical line: CEO → Assistant */}
      <Box sx={{ width: 2, height: 40, bgcolor: "grey.300" }} />

      {/* Executive Assistant */}
      {assistant && (
        <>
          <Paper elevation={2} sx={{ width: 300, p: 2, borderRadius: 2 }}>
            <EmployeeCard employee={assistant} />
          </Paper>

          {/* Branching connector: Assistant → Departments */}
          {departments.length > 0 && (
            <TreeConnector departmentCount={departments.length} />
          )}
        </>
      )}

      {/* Departments */}
      {departments.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", gap: 4 }}>
          {departments.map((department) => (
            <Stack
              key={department.id}
              spacing={2}
              sx={{ alignItems: "center" }}
            >
              <DepartmentHeader
                title={department.department!}
                color={department.departmentColor!}
                count={department.teamCount}
              />
              <Paper elevation={2} sx={{ width: 300, p: 2, borderRadius: 2 }}>
                <EmployeeCard employee={department} />
              </Paper>
            </Stack>
          ))}
        </Box>
      )}
    </Stack>
  );
}

export default TreeNode;