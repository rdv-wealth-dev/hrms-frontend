import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

export function PageLoader() {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        width: "100%",
        bgcolor: "background.paper",
      }}
    >
      <CircularProgress sx={{ color: "primary.main" }} size={40} />
    </Box>
  );
}

export default PageLoader;
