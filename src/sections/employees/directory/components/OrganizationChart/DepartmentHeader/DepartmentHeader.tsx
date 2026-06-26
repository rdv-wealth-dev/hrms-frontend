import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

type Props = {
  title: string;
  color: string;
  count: number;
};

function DepartmentHeader({ title, color, count }: Props) {
  return (
    <Paper
      elevation={2}
      sx={{
        width: 300,
        borderTop: `4px solid ${color}`,
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography sx={{ color, fontWeight: 600 }}>
          {title}
        </Typography>

        <Chip size="small" label={count} />
      </Box>
    </Paper>
  );
}

export default DepartmentHeader;