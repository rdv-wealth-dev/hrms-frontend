import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import LogoutIcon from "@mui/icons-material/Logout";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import { getMyTodayAttendance, recordPunch, listShifts } from "../../../api/attendance.api";
import type { AttendanceRecord } from "../../../store/attendance/attendance.types";
import { formatWorkedTime } from "../../../utils/time";
import { getCurrentPosition } from "../../../utils/geolocation";
import { useProfileBlockDetect } from "../../../hooks/useProfileBlockDetect";

export default function DailyPunchCard() {
  const navigate = useNavigate();
  const [record, setRecord] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [punching, setPunching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [time, setTime] = useState(new Date());
  const [defaultShiftId, setDefaultShiftId] = useState<string | null>(null);
  const { isBlocked, pendingSections, detectBlock, reset } = useProfileBlockDetect();

  const getLocation = async (): Promise<{ longitude: number; latitude: number } | null> => {
    try {
      const pos = await getCurrentPosition();
      return { longitude: pos.lng, latitude: pos.lat };
    } catch {
      return null;
    }
  };

  // Update localized digital clock every second
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadTodayAttendance = async () => {
    setLoading(true);
    setError(null);
    reset();
    try {
      const response = await getMyTodayAttendance();
      if (response.succeeded && response.data) {
        setRecord(response.data);
      } else {
        setError(response.message || "Failed to load daily attendance status");
      }
    } catch (err: any) {
      const handled = await detectBlock(err);
      if (!handled) {
        setError(
          err.response?.data?.message || err.message || "Failed to load daily attendance status"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTodayAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCheckIn = async () => {
    setPunching(true);
    setError(null);
    setSuccess(null);
    try {
      let shiftIdToUse = defaultShiftId || record?.shiftId;

      if (!shiftIdToUse) {
        try {
          const shiftsRes = await listShifts();
          if (shiftsRes.succeeded && shiftsRes.data && shiftsRes.data.length > 0) {
            const defaultShift = shiftsRes.data.find((s) => s.isDefault) || shiftsRes.data[0];
            shiftIdToUse = defaultShift._id;
            setDefaultShiftId(shiftIdToUse);
          }
        } catch (shiftErr) {
          console.warn("Failed to fetch shifts list:", shiftErr);
        }
      }

      if (!shiftIdToUse) {
        throw new Error("No active shifts available. Please set up a shift in the system settings first.");
      }

      const loc = await getLocation();
      const response = await recordPunch("CHECK_IN", shiftIdToUse, loc?.longitude, loc?.latitude);
      if (response.succeeded && response.data) {
        setRecord(response.data);
        setSuccess("Checked in successfully!");
      } else {
        setError(response.message || "Failed to clock in");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Something went wrong during check-in"
      );
    } finally {
      setPunching(false);
    }
  };

  const handleCheckOut = async () => {
    setPunching(true);
    setError(null);
    setSuccess(null);
    try {
      const loc = await getLocation();
      const response = await recordPunch("CHECK_OUT", undefined, loc?.longitude, loc?.latitude);
      if (response.succeeded && response.data) {
        setRecord(response.data);
        setSuccess("Checked out successfully!");
      } else {
        setError(response.message || "Failed to clock out");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Something went wrong during check-out"
      );
    } finally {
      setPunching(false);
    }
  };

  const handleBreakOut = async () => {
    setPunching(true);
    setError(null);
    setSuccess(null);
    try {
      const loc = await getLocation();
      const response = await recordPunch("BREAK_OUT", undefined, loc?.longitude, loc?.latitude);
      if (response.succeeded && response.data) {
        setRecord(response.data);
        setSuccess("Took a break successfully!");
      } else {
        setError(response.message || "Failed to log break");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Something went wrong during break-out"
      );
    } finally {
      setPunching(false);
    }
  };

  const handleBreakIn = async () => {
    setPunching(true);
    setError(null);
    setSuccess(null);
    try {
      const loc = await getLocation();
      const response = await recordPunch("BREAK_IN", undefined, loc?.longitude, loc?.latitude);
      if (response.succeeded && response.data) {
        setRecord(response.data);
        setSuccess("Resumed shift successfully!");
      } else {
        setError(response.message || "Failed to resume shift");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Something went wrong during break-in"
      );
    } finally {
      setPunching(false);
    }
  };

  // Locale-aware formatting for digital clock & date (supports international timezones out of the box)
  const formattedTime = new Intl.DateTimeFormat(navigator.language, {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZoneName: "short",
  }).format(time);

  const formattedDate = new Intl.DateTimeFormat(navigator.language, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(time);

  // Determine current states based on the LAST session in the sessions list
  const lastSession = record && record.sessions && record.sessions.length > 0
    ? record.sessions[record.sessions.length - 1]
    : null;

  const hasCheckedOut = lastSession?.type === "CHECK_OUT";
  const hasCheckedIn = record && record.sessions && record.sessions.some(s => s.type === "CHECK_IN") && !hasCheckedOut;
  const isOnBreak = lastSession?.type === "BREAK_OUT";
  const isActiveShift = hasCheckedIn && !isOnBreak && !hasCheckedOut;

  // Resolve check-in and check-out timestamps
  const checkInSession = record?.sessions?.find(s => s.type === "CHECK_IN");
  const checkOutSession = record?.sessions?.find(s => s.type === "CHECK_OUT");

  const checkInTime = checkInSession
    ? new Date(checkInSession.timestamp).toLocaleTimeString(navigator.language, {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "";

  const checkOutTime = checkOutSession
    ? new Date(checkOutSession.timestamp).toLocaleTimeString(navigator.language, {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "";

  // UI styling based on current state
  let chipLabel = "Not Clocked In";
  let chipColorBg = "rgba(107, 114, 128, 0.08)";
  let chipColorText = "#6B7280";
  let chipBorder = "1px solid rgba(107, 114, 128, 0.1)";
  let glowColor = "rgba(109, 93, 246, 0.05)";

  if (hasCheckedOut) {
    chipLabel = "Shift Completed";
    chipColorBg = "rgba(99, 102, 241, 0.1)";
    chipColorText = "#6366F1";
    chipBorder = "1px solid rgba(99, 102, 241, 0.2)";
    glowColor = "rgba(99, 102, 241, 0.05)";
  } else if (isOnBreak) {
    chipLabel = "On Break";
    chipColorBg = "rgba(245, 158, 11, 0.1)";
    chipColorText = "#F59E0B";
    chipBorder = "1px solid rgba(245, 158, 11, 0.2)";
    glowColor = "rgba(245, 158, 11, 0.05)";
  } else if (isActiveShift) {
    chipLabel = "Active Shift";
    chipColorBg = "rgba(16, 185, 129, 0.1)";
    chipColorText = "#10B981";
    chipBorder = "1px solid rgba(16, 185, 129, 0.2)";
    glowColor = "rgba(16, 185, 129, 0.05)";
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 3,
        backgroundColor: "#fff",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        width: "100%",
        maxWidth: "100%",
        display: "flex",
        flexDirection: "column",
        gap: { xs: 2, sm: 2.5 },
        border: "1px solid rgba(0,0,0,0.03)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background soft glow accent */}
      <Box
        sx={{
          position: "absolute",
          top: -60,
          right: -60,
          width: 140,
          height: 140,
          borderRadius: "50%",
          backgroundColor: glowColor,
          filter: "blur(20px)",
          pointerEvents: "none",
        }}
      />

      {isBlocked ? (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 3, gap: 2.5 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: "50%",
              backgroundColor: "rgba(245, 158, 11, 0.08)",
              color: "#F59E0B",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LockOutlinedIcon sx={{ fontSize: 32 }} />
          </Box>

          <Box sx={{ textAlign: "center", maxWidth: 360 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#111827", mb: 0.5 }}>
              Profile Incomplete
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please complete your profile to unlock daily attendance clocking in/out.
            </Typography>
          </Box>

          {pendingSections.length > 0 && (
            <Box
              sx={{
                width: "100%",
                maxWidth: 360,
                backgroundColor: "rgba(245, 158, 11, 0.05)",
                borderRadius: 2,
                p: 2,
                border: "1px solid rgba(245, 158, 11, 0.15)",
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 700, color: "#B45309", display: "block", mb: 1 }}>
                Pending Profile Sections:
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
                {pendingSections.map((sec) => (
                  <Chip
                    key={sec}
                    label={sec}
                    size="small"
                    sx={{
                      backgroundColor: "#FEF3C7",
                      color: "#92400E",
                      fontWeight: 600,
                      fontSize: "11px",
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          <Button
            variant="contained"
            fullWidth
            onClick={() => navigate("/profile")}
            sx={{
              maxWidth: 360,
              py: 1.2,
              borderRadius: 2.5,
              fontWeight: 600,
              textTransform: "none",
              backgroundColor: "#6D5DF6",
              "&:hover": { backgroundColor: "#5B4BEA" },
            }}
          >
            Complete Profile
          </Button>
        </Box>
      ) : (
        <>
          {/* Title & Live Status Chip */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AccessTimeIcon sx={{ color: isOnBreak ? "#F59E0B" : isActiveShift ? "#10B981" : hasCheckedOut ? "#6366F1" : "#6D5DF6" }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#111827" }}>
            Daily Attendance
          </Typography>
        </Box>
        {loading ? (
          <CircularProgress size={16} />
        ) : (
          <Chip
            label={chipLabel}
            size="small"
            sx={{
              fontWeight: 600,
              fontSize: "0.75rem",
              backgroundColor: chipColorBg,
              color: chipColorText,
              border: chipBorder,
            }}
          />
        )}
      </Box>

      {/* Localized Digital Clock Display */}
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 1 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            color: "#1E1B4B",
            fontFamily: "'Outfit', 'Inter', sans-serif",
            letterSpacing: "-0.5px",
            lineHeight: 1.1,
            fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
          }}
        >
          {formattedTime}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
          {formattedDate}
        </Typography>
      </Box>

      {/* Inline Feedback Alerts */}
      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ borderRadius: 2 }}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Action Triggers */}
      {!loading && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {/* 1. Never Clocked In */}
          {!hasCheckedIn && !hasCheckedOut && (
            <Button
              variant="contained"
              fullWidth
              size="large"
              disabled={punching}
              onClick={handleCheckIn}
              startIcon={
                punching ? <CircularProgress size={20} color="inherit" /> : <MeetingRoomIcon />
              }
              sx={{
                py: 1.5,
                borderRadius: 2.5,
                fontSize: "1rem",
                fontWeight: 600,
                textTransform: "none",
                backgroundColor: "#6D5DF6",
                boxShadow: "0 4px 14px rgba(109, 93, 246, 0.25)",
                "&:hover": {
                  backgroundColor: "#5B4BEA",
                  boxShadow: "0 6px 20px rgba(109, 93, 246, 0.35)",
                },
              }}
            >
              {punching ? "Clocking In..." : "Clock In"}
            </Button>
          )}

          {/* 2. Clocked In & Active Shift */}
          {isActiveShift && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  backgroundColor: "rgba(16, 185, 129, 0.04)",
                  border: "1px dashed rgba(16, 185, 129, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <CheckCircleOutlinedIcon sx={{ color: "#10B981", fontSize: 28 }} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#1E1B4B" }}>
                    Check-In Recorded
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Shift started at {checkInTime} today.
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={punching}
                  onClick={handleBreakOut}
                  startIcon={
                    punching ? <CircularProgress size={20} color="inherit" /> : <PauseIcon />
                  }
                  sx={{
                    py: 1.5,
                    borderRadius: 2.5,
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    textTransform: "none",
                    backgroundColor: "#F59E0B",
                    boxShadow: "0 4px 14px rgba(245, 158, 11, 0.25)",
                    "&:hover": {
                      backgroundColor: "#D97706",
                      boxShadow: "0 6px 20px rgba(245, 158, 11, 0.35)",
                    },
                  }}
                >
                  {punching ? "Processing..." : "Break Out"}
                </Button>

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={punching}
                  onClick={handleCheckOut}
                  startIcon={
                    punching ? <CircularProgress size={20} color="inherit" /> : <LogoutIcon />
                  }
                  sx={{
                    py: 1.5,
                    borderRadius: 2.5,
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    textTransform: "none",
                    backgroundColor: "#EF4444",
                    boxShadow: "0 4px 14px rgba(239, 68, 68, 0.25)",
                    "&:hover": {
                      backgroundColor: "#DC2626",
                      boxShadow: "0 6px 20px rgba(239, 68, 68, 0.35)",
                    },
                  }}
                >
                  {punching ? "Clocking Out..." : "Clock Out"}
                </Button>
              </Box>
            </Box>
          )}

          {/* 3. On Break State */}
          {isOnBreak && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  backgroundColor: "rgba(245, 158, 11, 0.04)",
                  border: "1px dashed rgba(245, 158, 11, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <PauseIcon sx={{ color: "#F59E0B", fontSize: 28 }} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#1E1B4B" }}>
                    Currently On Break
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Break started at {
                      record?.sessions?.filter(s => s.type === "BREAK_OUT").slice(-1)[0]
                        ? new Date(record.sessions.filter(s => s.type === "BREAK_OUT").slice(-1)[0].timestamp).toLocaleTimeString(navigator.language, {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })
                        : ""
                    }.
                  </Typography>
                </Box>
              </Box>

              <Button
                variant="contained"
                fullWidth
                size="large"
                disabled={punching}
                onClick={handleBreakIn}
                startIcon={
                  punching ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />
                }
                sx={{
                  py: 1.5,
                  borderRadius: 2.5,
                  fontSize: "1rem",
                  fontWeight: 600,
                  textTransform: "none",
                  backgroundColor: "#10B981",
                  boxShadow: "0 4px 14px rgba(16, 185, 129, 0.25)",
                  "&:hover": {
                    backgroundColor: "#059669",
                    boxShadow: "0 6px 20px rgba(16, 185, 129, 0.35)",
                  },
                }}
              >
                {punching ? "Resuming..." : "Resume Shift"}
              </Button>
            </Box>
          )}

          {/* 4. Shift Completed Summary */}
          {hasCheckedOut && (
            <Box
              sx={{
                p: 2.5,
                borderRadius: 2.5,
                backgroundColor: "rgba(99, 102, 241, 0.03)",
                border: "1px solid rgba(99, 102, 241, 0.12)",
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <CheckCircleOutlinedIcon sx={{ color: "#6366F1", fontSize: 28 }} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#1E1B4B" }}>
                    Shift Summary
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Your shift is complete for today.
                  </Typography>
                </Box>
              </Box>
              <Divider />
              <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                    Clock In
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#1E1B4B" }}>
                    {checkInTime}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                    Clock Out
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#1E1B4B" }}>
                    {checkOutTime}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                    Worked Hours
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#6366F1" }}>
                    {formatWorkedTime(record?.workedMinutes ?? 0)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      )}
        </>
      )}
    </Paper>
  );
}

