import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Switch from "@mui/material/Switch";

type ModuleToggleCardProps = {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled: boolean;
  icon: React.ReactNode;
};

export default function ModuleToggleCard({
  title,
  description,
  checked,
  onChange,
  disabled,
  icon,
}: ModuleToggleCardProps) {
  return (
    <Paper
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.02)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        transition: "all 0.2s ease-in-out",
        opacity: disabled && !checked ? 0.6 : 1,
        "&:hover": {
          boxShadow: "0px 6px 20px rgba(0, 0, 0, 0.05)",
          borderColor: "primary.main",
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 0 }}>
        <Box
          sx={{
            p: 1.2,
            borderRadius: 2,
            backgroundColor: checked
              ? "primary.lighter"
              : "action.hover",
            color: checked ? "primary.main" : "text.secondary",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "all 0.2s ease",
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>
            {title}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {description}
          </Typography>
        </Box>
      </Box>

      <Switch
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        sx={{
          "& .MuiSwitch-switchBase.Mui-checked": {
            color: "primary.main",
            "&:hover": {
              backgroundColor: "primary.lighter",
            },
          },
          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
            backgroundColor: "primary.main",
          },
        }}
      />
    </Paper>
  );
}
