import Stack from "@mui/material/Stack";

import EmployeeNode from "../EmployeeNode";

function OrganizationTree() {
  return (
    <Stack spacing={5} sx={{ alignItems: "center", py: 6, minWidth: 1200 }}>
      {/* CEO */}
      <EmployeeNode />

      {/* Executive Assistant */}
      <EmployeeNode />

      {/* Departments Placeholder */}
      <Stack
        direction="row"
        spacing={8}
      >
        <EmployeeNode />
        <EmployeeNode />
        <EmployeeNode />
        <EmployeeNode />
        <EmployeeNode />
      </Stack>
    </Stack>
  );
}

export default OrganizationTree;