import Box from "@mui/material/Box";

type Props = {
  children: React.ReactNode;
};

function AuthRightSection({ children }: Props) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: { xs: 2.5, sm: 4, md: 5 } }}>
      <Box sx={{ width: "100%", maxWidth: 448 }}>{children}</Box>
    </Box>
  );
}

export default AuthRightSection;