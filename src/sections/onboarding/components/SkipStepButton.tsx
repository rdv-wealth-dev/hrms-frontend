import Button from "@mui/material/Button";
import SkipNextIcon from "@mui/icons-material/SkipNext";

interface SkipStepButtonProps {
  onSkip?: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export default function SkipStepButton({ onSkip, loading, disabled }: SkipStepButtonProps) {
  if (!onSkip) return null;

  return (
    <Button
      variant="outlined"
      onClick={onSkip}
      disabled={loading || disabled}
      endIcon={<SkipNextIcon />}
      sx={{
        px: 3,
        py: 1.2,
        borderRadius: "10px",
        color: "#64748B",
        borderColor: "#CBD5E1",
        fontWeight: 600,
        textTransform: "none",
        "&:hover": {
          backgroundColor: "#F8FAFC",
          borderColor: "#94A3B8",
        },
        width: { xs: "100%", sm: "auto" },
      }}
    >
      {loading ? "Skipping..." : "Skip & Fill Later"}
    </Button>
  );
}
