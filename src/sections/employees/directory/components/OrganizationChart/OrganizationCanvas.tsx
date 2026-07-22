import Box from "@mui/material/Box";
import OrganizationTree from "../OrganizationTree";

function OrganizationCanvas() {
  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        pt: 5,
      }}
    >
      <OrganizationTree />
    </Box>
  );
}

export default OrganizationCanvas;