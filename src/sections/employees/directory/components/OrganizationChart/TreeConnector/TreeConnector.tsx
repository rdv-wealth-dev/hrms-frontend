import Box from "@mui/material/Box";

const CARD_WIDTH = 300;
const GAP = 32; // gap={4} in MUI = 4 * 8px = 32px

type Props = {
  departmentCount: number;
};

function TreeConnector({ departmentCount }: Props) {
  const totalWidth = departmentCount * CARD_WIDTH + (departmentCount - 1) * GAP;
  const firstCenter = CARD_WIDTH / 2;
  const lastCenter = totalWidth - CARD_WIDTH / 2;
  const height = 48;

  return (
    <Box
      sx={{
        position: "relative",
        width: totalWidth,
        height,
        flexShrink: 0,
      }}
    >
      {/* Vertical line coming down from Assistant */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: 2,
          height: height / 2,
          bgcolor: "grey.300",
        }}
      />

      {/* Horizontal line spanning all departments */}
      <Box
        sx={{
          position: "absolute",
          top: height / 2,
          left: firstCenter,
          width: lastCenter - firstCenter,
          height: 2,
          bgcolor: "grey.300",
        }}
      />

      {/* Vertical lines going down to each department */}
      {Array.from({ length: departmentCount }).map((_, i) => (
        <Box
          key={i}
          sx={{
            position: "absolute",
            top: height / 2,
            left: firstCenter + i * (CARD_WIDTH + GAP) - 1,
            width: 2,
            height: height / 2,
            bgcolor: "grey.300",
          }}
        />
      ))}
    </Box>
  );
}

export default TreeConnector;