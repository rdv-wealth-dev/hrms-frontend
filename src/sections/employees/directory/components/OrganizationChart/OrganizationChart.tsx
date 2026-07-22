import Paper from "@mui/material/Paper";

import TreeNode from "./TreeNode";
import { organizationData } from "./mockData";

function OrganizationChart() {
  return (
    <Paper
      elevation={1}
      sx={{
        flex: 1,
        p: 4,
        borderRadius: 2,
        overflow: "auto",
      }}
    >
      <TreeNode employee={organizationData} />
    </Paper>
  );
}

export default OrganizationChart;