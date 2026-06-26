import Stack from "@mui/material/Stack";
import DirectoryHeader from "./components/DirectoryHeader";
import DirectoryToolbar from "./components/DirectoryToolbar";
import OrganizationChart from "./components/OrganizationChart";

function EmployeeDirectoryView() {
  return (
    <Stack
  spacing={3}
  sx={{
    p: 3,
    height: "100vh",
    bgcolor: "background.default",
  }}
>
      <DirectoryHeader />

      <DirectoryToolbar />

      <OrganizationChart />
    </Stack>
  );
}

export default EmployeeDirectoryView;