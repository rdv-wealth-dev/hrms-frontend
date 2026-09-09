import { useState } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import OutlinedInput from "@mui/material/OutlinedInput";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";

import StatusChip from "../../../components/common/StatusChip";
import PrimaryButton from "../../../components/button/PrimaryButton";
import {
  PAY_CALENDAR_POLICY_MOCK_DATA,
  type PayCalendarPolicyData,
} from "../mock/payroll-data";

interface PayCalendarContentProps {
  data?: PayCalendarPolicyData;
}

export function PayCalendarContent({
  data = PAY_CALENDAR_POLICY_MOCK_DATA,
}: PayCalendarContentProps) {
  const [payCycleType, setPayCycleType] = useState(data?.payCycleType ?? "FIRST_TO_LAST");
  const [attendanceCutoffDay, setAttendanceCutoffDay] = useState(data?.attendanceCutoffDay ?? 20);
  const [startDay, setStartDay] = useState(data?.startDay ?? 1);
  const [endDay, setEndDay] = useState(data?.endDay ?? 31);
  const [paymentDay, setPaymentDay] = useState(data?.paymentDay ?? 30);
  const [paidWeeklyOffs, setPaidWeeklyOffs] = useState(data?.paidWeeklyOffs ?? true);
  const [useFixed30DayDivisor, setUseFixed30DayDivisor] = useState(data?.useFixed30DayDivisor ?? false);

  return (
    <Box sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
      {/* 1. Header Bar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
          pb: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: "text.primary",
            letterSpacing: "-0.3px",
          }}
        >
          Pay Calendar & Cutoffs
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <StatusChip
            variant="outlined"
            label="Aug 2026 · DRAFT"
            sx={{
              fontWeight: 700,
              fontSize: "0.8125rem",
              borderColor: "error.main",
              color: "error.main",
              backgroundColor: "transparent",
            }}
          />
        </Box>
      </Box>

      {/* 2. Endpoint Pill */}
      <Box sx={{ mb: 2.5 }}>
        <Box
          component="span"
          sx={{
            display: "inline-block",
            px: 1,
            py: 0.25,
            borderRadius: 1,
            border: "1px solid",
            borderColor: "error.main",
            color: "error.main",
            fontFamily: "monospace",
            fontSize: "0.75rem",
            fontWeight: 600,
          }}
        >
          POST /payroll/calendar-policy
        </Box>
      </Box>

      {/* 3. Form Card */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3 },
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.paper",
          maxWidth: { xs: "100%", md: 680 },
        }}
      >
        <Grid container spacing={2.5}>
          {/* Row 1: Pay Cycle Type & Attendance Cutoff Day */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography
              variant="caption"
              sx={{
                display: "block",
                fontWeight: 500,
                color: "text.secondary",
                fontSize: "0.75rem",
                mb: 0.75,
              }}
            >
              Pay Cycle Type
            </Typography>
            <Select
              size="small"
              fullWidth
              value={payCycleType}
              onChange={(e) => setPayCycleType(e.target.value)}
              sx={{
                height: 38,
                borderRadius: 1.5,
                fontSize: "0.875rem",
                backgroundColor: "background.paper",
              }}
            >
              {(data?.payCycleOptions ?? [
                { label: "FIRST_TO_LAST", value: "FIRST_TO_LAST" },
                { label: "CUSTOM_RANGE", value: "CUSTOM_RANGE" },
              ]).map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography
              variant="caption"
              sx={{
                display: "block",
                fontWeight: 500,
                color: "text.secondary",
                fontSize: "0.75rem",
                mb: 0.75,
              }}
            >
              Attendance Cutoff Day
            </Typography>
            <OutlinedInput
              size="small"
              fullWidth
              value={attendanceCutoffDay}
              onChange={(e) => setAttendanceCutoffDay(e.target.value)}
              sx={{
                height: 38,
                borderRadius: 1.5,
                fontSize: "0.875rem",
                backgroundColor: "background.paper",
              }}
            />
          </Grid>

          {/* Row 2: Start Day & End Day */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography
              variant="caption"
              sx={{
                display: "block",
                fontWeight: 500,
                color: "text.secondary",
                fontSize: "0.75rem",
                mb: 0.75,
              }}
            >
              Start Day
            </Typography>
            <OutlinedInput
              size="small"
              fullWidth
              value={startDay}
              onChange={(e) => setStartDay(e.target.value)}
              sx={{
                height: 38,
                borderRadius: 1.5,
                fontSize: "0.875rem",
                backgroundColor: "background.paper",
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography
              variant="caption"
              sx={{
                display: "block",
                fontWeight: 500,
                color: "text.secondary",
                fontSize: "0.75rem",
                mb: 0.75,
              }}
            >
              End Day
            </Typography>
            <OutlinedInput
              size="small"
              fullWidth
              value={endDay}
              onChange={(e) => setEndDay(e.target.value)}
              sx={{
                height: 38,
                borderRadius: 1.5,
                fontSize: "0.875rem",
                backgroundColor: "background.paper",
              }}
            />
          </Grid>

          {/* Row 3: Payment Day */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography
              variant="caption"
              sx={{
                display: "block",
                fontWeight: 500,
                color: "text.secondary",
                fontSize: "0.75rem",
                mb: 0.75,
              }}
            >
              Payment Day
            </Typography>
            <OutlinedInput
              size="small"
              fullWidth
              value={paymentDay}
              onChange={(e) => setPaymentDay(e.target.value)}
              sx={{
                height: 38,
                borderRadius: 1.5,
                fontSize: "0.875rem",
                backgroundColor: "background.paper",
              }}
            />
          </Grid>

          {/* Row 4: Radio Options */}
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}>
              <FormControlLabel
                control={
                  <Radio
                    size="small"
                    checked={paidWeeklyOffs}
                    onChange={() => {
                      setPaidWeeklyOffs(true);
                      setUseFixed30DayDivisor(false);
                    }}
                    sx={{
                      color: "error.main",
                      "&.Mui-checked": {
                        color: "error.main",
                      },
                    }}
                  />
                }
                label={
                  <Typography sx={{ fontSize: "0.875rem", color: "text.primary" }}>
                    Paid weekly offs
                  </Typography>
                }
              />

              <FormControlLabel
                control={
                  <Radio
                    size="small"
                    checked={useFixed30DayDivisor}
                    onChange={() => {
                      setUseFixed30DayDivisor(true);
                      setPaidWeeklyOffs(false);
                    }}
                    sx={{
                      color: "error.main",
                      "&.Mui-checked": {
                        color: "error.main",
                      },
                    }}
                  />
                }
                label={
                  <Typography sx={{ fontSize: "0.875rem", color: "text.primary" }}>
                    Use fixed 30-day divisor
                  </Typography>
                }
              />
            </Box>
          </Grid>

          {/* Row 5: Save Policy Button */}
          <Grid size={{ xs: 12 }}>
            <Box sx={{ width: { xs: "100%", sm: 160 }, mt: 1 }}>
              <PrimaryButton>
                Save Policy
              </PrimaryButton>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}

export default PayCalendarContent;
