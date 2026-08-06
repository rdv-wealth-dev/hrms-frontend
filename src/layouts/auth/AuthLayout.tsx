import Box from "@mui/material/Box";

type Props = {
  children: React.ReactNode;
};

function AuthLayout({ children }: Props) {
  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        width: "100%",
        overflow: "hidden",
        backgroundColor: "#818CF8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: { xs: 1.5, sm: 2.5, md: 4 },
      }}
    >
      {/* Outer Left Large Circle */}
      <Box
        sx={{
          position: "absolute",
          left: { xs: 16, sm: 80 },
          bottom: 0,
          width: { xs: 192, sm: 288 },
          height: { xs: 192, sm: 288 },
          borderRadius: "50%",
          backgroundColor: "rgba(255, 255, 255, 0.15)",
          pointerEvents: "none",
        }}
      />

      {/* Outer Left Small Circle */}
      <Box
        sx={{
          position: "absolute",
          left: { xs: 8, sm: 40 },
          bottom: { xs: 144, sm: 208 },
          width: { xs: 48, sm: 64 },
          height: { xs: 48, sm: 64 },
          borderRadius: "50%",
          backgroundColor: "rgba(255, 255, 255, 0.15)",
          pointerEvents: "none",
        }}
      />

      {/* Outer Right Large Circle */}
      <Box
        sx={{
          position: "absolute",
          right: { xs: -48, sm: -96 },
          top: { xs: 24, sm: 48 },
          width: { xs: 192, sm: 288 },
          height: { xs: 192, sm: 288 },
          borderRadius: "50%",
          backgroundColor: "rgba(255, 255, 255, 0.15)",
          pointerEvents: "none",
        }}
      />

      {/* White Central Card */}
      <Box
        sx={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: { xs: "94vw", sm: 576, md: 672 },
          overflow: "hidden",
          borderRadius: { xs: "16px", sm: "24px" },
          backgroundColor: "#FCFCFD",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          transition: "all 0.3s ease-in-out",
          my: "auto",
        }}
      >
        {/* Card Decorative Circle Left Big */}
        <Box
          sx={{
            position: "absolute",
            left: { xs: -96, sm: -128 },
            bottom: { xs: -96, sm: -128 },
            width: { xs: 256, sm: 320 },
            height: { xs: 256, sm: 320 },
            borderRadius: "50%",
            backgroundColor: "rgba(109, 93, 246, 0.1)",
            pointerEvents: "none",
          }}
        />

        {/* Card Decorative Circle Left Small */}
        <Box
          sx={{
            position: "absolute",
            left: { xs: 12, sm: 24 },
            bottom: { xs: 48, sm: 64 },
            width: { xs: 64, sm: 96 },
            height: { xs: 64, sm: 96 },
            borderRadius: "50%",
            backgroundColor: "rgba(109, 93, 246, 0.1)",
            pointerEvents: "none",
          }}
        />

        {/* Card Decorative Circle Right Big */}
        <Box
          sx={{
            position: "absolute",
            right: { xs: -96, sm: -144 },
            top: { xs: -64, sm: -80 },
            width: { xs: 288, sm: 384 },
            height: { xs: 288, sm: 384 },
            borderRadius: "50%",
            backgroundColor: "rgba(109, 93, 246, 0.1)",
            pointerEvents: "none",
          }}
        />

        {/* Card Decorative Circle Right Small */}
        <Box
          sx={{
            position: "absolute",
            right: { xs: -32, sm: -40 },
            top: { xs: 16, sm: 24 },
            width: { xs: 112, sm: 160 },
            height: { xs: 112, sm: 160 },
            borderRadius: "50%",
            backgroundColor: "rgba(109, 93, 246, 0.05)",
            pointerEvents: "none",
          }}
        />

        <Box
          sx={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            py: { xs: 3, sm: 3.5, md: 4.5 },
            px: { xs: 2.5, sm: 3, md: 5 },
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}

export default AuthLayout;