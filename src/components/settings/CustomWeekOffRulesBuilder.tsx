import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Alert from "@mui/material/Alert";
import Paper from "@mui/material/Paper";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import type { CustomWeekOffRule, DayOfWeek } from "../../store/organization/organization.types";

interface CustomWeekOffRulesBuilderProps {
  rules: CustomWeekOffRule[];
  onChange: (rules: CustomWeekOffRule[]) => void;
  disabled?: boolean;
}

const ALL_DAYS: DayOfWeek[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const WEEK_OCCURRENCES = [
  { value: 1, label: "1st" },
  { value: 2, label: "2nd" },
  { value: 3, label: "3rd" },
  { value: 4, label: "4th" },
  { value: 5, label: "5th (if exists)" },
];

export function CustomWeekOffRulesBuilder({
  rules,
  onChange,
  disabled = false,
}: CustomWeekOffRulesBuilderProps) {
  const handleAddRule = () => {
    // Find first day not already configured, or default to Saturday
    const configuredDays = rules.map((r) => r.dayOfWeek);
    const availableDay = ALL_DAYS.find((d) => !configuredDays.includes(d)) || "Saturday";

    onChange([...rules, { dayOfWeek: availableDay, weeks: [2, 4] }]);
  };

  const handleRemoveRule = (index: number) => {
    const updated = rules.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleDayChange = (index: number, newDay: DayOfWeek) => {
    const updated = [...rules];
    updated[index] = { ...updated[index], dayOfWeek: newDay };
    onChange(updated);
  };

  const handleWeekToggle = (index: number, weekNum: number) => {
    const updated = [...rules];
    const currentWeeks = updated[index].weeks || [];
    const isChecked = currentWeeks.includes(weekNum);

    const newWeeks = isChecked
      ? currentWeeks.filter((w) => w !== weekNum).sort((a, b) => a - b)
      : [...currentWeeks, weekNum].sort((a, b) => a - b);

    updated[index] = { ...updated[index], weeks: newWeeks };
    onChange(updated);
  };

  const handleToggleAllWeeks = (index: number) => {
    const updated = [...rules];
    const currentWeeks = updated[index].weeks || [];
    const allSelected = currentWeeks.length === 5;

    updated[index] = {
      ...updated[index],
      weeks: allSelected ? [] : [1, 2, 3, 4, 5],
    };
    onChange(updated);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.95rem" }}>
            Custom Week-Off Rules
          </Typography>
          <Typography variant="caption" sx={{ color: "#64748B" }}>
            Configure specific occurrences (e.g. 2nd & 4th Saturday, 5th Friday) as off-days
          </Typography>
        </Box>

        <Button
          startIcon={<AddIcon />}
          onClick={handleAddRule}
          disabled={disabled || rules.length >= 7}
          size="small"
          sx={{
            textTransform: "none",
            fontWeight: 600,
            color: "#4F46E5",
            border: "1px dashed #A5B4FC",
            borderRadius: "8px",
            px: 1.5,
            py: 0.5,
            "&:hover": { backgroundColor: "#EEF2FF", borderColor: "#6366F1" },
          }}
        >
          Add Custom Rule
        </Button>
      </Box>

      {/* Rule Rows */}
      {rules.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{
            p: 2.5,
            textAlign: "center",
            borderRadius: "12px",
            backgroundColor: "#F8FAFC",
            borderStyle: "dashed",
            borderColor: "#E2E8F0",
            mb: 2,
          }}
        >
          <Typography variant="body2" sx={{ color: "#64748B", fontWeight: 500 }}>
            No custom occurrence rules added. Click <strong>"+ Add Custom Rule"</strong> to define specific weekend off days.
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 2 }}>
          {rules.map((rule, idx) => (
            <Paper
              key={idx}
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: "12px",
                borderColor: "#E2E8F0",
                backgroundColor: "#FFFFFF",
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "stretch", sm: "center" },
                gap: 2,
              }}
            >
              {/* Day Selector */}
              <TextField
                select
                label="Day of Week"
                size="small"
                value={rule.dayOfWeek}
                onChange={(e) => handleDayChange(idx, e.target.value as DayOfWeek)}
                disabled={disabled}
                sx={{ minWidth: 160 }}
              >
                {ALL_DAYS.map((day) => {
                  const isAlreadyUsed = rules.some((r, i) => i !== idx && r.dayOfWeek === day);
                  return (
                    <MenuItem key={day} value={day} disabled={isAlreadyUsed}>
                      {day} {isAlreadyUsed ? "(Configured)" : ""}
                    </MenuItem>
                  );
                })}
              </TextField>

              {/* Occurrence Checkboxes + Delete Button — all on one row */}
              <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: "#475569", mr: 0.5 }}>
                  Month Occurrences:
                </Typography>
                {(() => {
                  const allSelected = (rule.weeks?.length || 0) === 5;
                  return (
                    <Chip
                      label={allSelected ? "Deselect All" : "Select All"}
                      size="small"
                      onClick={() => handleToggleAllWeeks(idx)}
                      disabled={disabled}
                      variant={allSelected ? "filled" : "outlined"}
                      sx={{
                        height: 22,
                        fontSize: "11px",
                        fontWeight: 700,
                        cursor: disabled ? "default" : "pointer",
                        backgroundColor: allSelected ? "#EEF2FF" : "transparent",
                        color: allSelected ? "#4F46E5" : "#64748B",
                        borderColor: allSelected ? "#C7D2FE" : "#CBD5E1",
                        mr: 1,
                        "&:hover": {
                          backgroundColor: allSelected ? "#E0E7FF" : "#F8FAFC",
                          borderColor: "#6366F1",
                        },
                      }}
                    />
                  );
                })()}
                {WEEK_OCCURRENCES.map((occ) => {
                  const isChecked = rule.weeks?.includes(occ.value);
                  return (
                    <FormControlLabel
                      key={occ.value}
                      control={
                        <Checkbox
                          checked={isChecked}
                          onChange={() => handleWeekToggle(idx, occ.value)}
                          disabled={disabled}
                          size="small"
                          sx={{
                            color: "#94A3B8",
                            "&.Mui-checked": { color: "#4F46E5" },
                          }}
                        />
                      }
                      label={
                        <Typography variant="body2" sx={{ fontSize: "0.85rem", fontWeight: isChecked ? 600 : 400, color: isChecked ? "#0F172A" : "#64748B" }}>
                          {occ.label}
                        </Typography>
                      }
                      sx={{ mr: 0.5 }}
                    />
                  );
                })}

                {/* Delete button — inline after 5th checkbox */}
                <IconButton
                  onClick={() => handleRemoveRule(idx)}
                  disabled={disabled}
                  size="small"
                  sx={{ ml: 0.5, color: "#94A3B8", "&:hover": { color: "#EF4444", backgroundColor: "#FEF2F2" } }}
                >
                  <DeleteOutlineOutlinedIcon fontSize="small" />
                </IconButton>
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      {/* Inter-locking Policy Warning Alert */}
      <Alert
        severity="info"
        icon={<InfoOutlinedIcon fontSize="inherit" sx={{ color: "#4F46E5" }} />}
        sx={{
          borderRadius: "12px",
          backgroundColor: "#EEF2FF",
          color: "#312E81",
          border: "1px solid #C7D2FE",
          fontSize: "0.825rem",
          fontWeight: 500,
        }}
      >
        <strong>Policy Note:</strong> Changes to custom week-off policies will automatically apply to attendance records, leave calculations (sandwich policy deduction), and payroll payable-days calculations.
      </Alert>
    </Box>
  );
}
