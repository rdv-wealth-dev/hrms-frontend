import Box from "@mui/material/Box";

type Props = {
  childCount: number;
  cardWidth?: number;
  gap?: number;
};

export default function TreeConnector({
  childCount,
  cardWidth = 290,
  gap = 32,
}: Props) {
  if (childCount <= 0) return null;

  const totalWidth = childCount * cardWidth + (childCount - 1) * gap;
  const firstCenter = cardWidth / 2;
  const lastCenter = totalWidth - cardWidth / 2;
  const height = 48;

  // If there's only 1 child, render a single straight vertical connector line
  if (childCount === 1) {
    return (
      <Box
        sx={{
          width: cardWidth,
          height,
          display: "flex",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            width: 2,
            height: "100%",
            backgroundColor: "#CBD5E1",
          }}
        />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: "relative",
        width: totalWidth,
        height,
        flexShrink: 0,
      }}
    >
      {/* 1. Vertical line coming down from parent manager card */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: 2,
          height: height / 2,
          backgroundColor: "#CBD5E1",
        }}
      />

      {/* 2. Horizontal bus line spanning all direct reports */}
      <Box
        sx={{
          position: "absolute",
          top: height / 2,
          left: firstCenter,
          width: lastCenter - firstCenter,
          height: 2,
          backgroundColor: "#CBD5E1",
        }}
      />

      {/* 3. Vertical drop lines entering each child node card */}
      {Array.from({ length: childCount }).map((_, i) => (
        <Box
          key={i}
          sx={{
            position: "absolute",
            top: height / 2,
            left: firstCenter + i * (cardWidth + gap) - 1,
            width: 2,
            height: height / 2,
            backgroundColor: "#CBD5E1",
          }}
        />
      ))}
    </Box>
  );
}