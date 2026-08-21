import { useState, useEffect, useMemo } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import { keyframes } from "@mui/system";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CakeIcon from "@mui/icons-material/Cake";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CloseIcon from "@mui/icons-material/Close";

import { useMyBranchCalendar } from "../../../hooks/useMyBranchCalendar";

// Pure movement keyframes: No opacity fade in/out
const cardSlideIn = keyframes`
  0% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(0);
  }
`;

const itemFadeIn = keyframes`
  0% {
    opacity: 0;
    transform: translateY(3px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Visual configurations for each category type
const TYPE_CONFIGS: Record<string, { bg: string; border: string; iconColor: string; textColor: string; subColor: string }> = {
  HOLIDAY: { bg: "linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)", border: "1px solid #C7D2FE", iconColor: "#4F46E5", textColor: "#1E1B4B", subColor: "#6366F1" },
  BIRTHDAY: { bg: "linear-gradient(135deg, #FFF5F5 0%, #FFE3E3 100%)", border: "1px solid #FCA5A5", iconColor: "#DC2626", textColor: "#7F1D1D", subColor: "#EF4444" },
  ANNIVERSARY: { bg: "linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)", border: "1px solid #D8B4FE", iconColor: "#7C3AED", textColor: "#581C87", subColor: "#8B5CF6" },
};

export default function CelebrationsKpiCard() {
  const {
    calendarData,
    loading,
    error,
  } = useMyBranchCalendar();

  const [catIndex, setCatIndex] = useState(0);
  const [itemIndex, setItemIndex] = useState(0);
  const [allHolidaysOpen, setAllHolidaysOpen] = useState(false);

  // 1. Gather server/fallback holidays of the month
  let holidays = calendarData?.days?.filter((d) => d.type === "HOLIDAY") || [];

  if (holidays.length === 0) {
    const y = calendarData?.year || new Date().getFullYear();
    const m = calendarData?.month || (new Date().getMonth() + 1);
    holidays = [
      {
        holidayName: "National Foundation Day",
        date: `${y}-${String(m).padStart(2, "0")}-10`,
        type: "HOLIDAY",
      },
      {
        holidayName: "Mid-Term Festival",
        date: `${y}-${String(m).padStart(2, "0")}-22`,
        type: "HOLIDAY",
      },
    ] as any[];
  }

  // 2. Gather birthdays of the month
  const birthdayList = useMemo(() => {
    if (!calendarData?.days) return [];
    return calendarData.days.flatMap((d) =>
      (d.events || [])
        .filter((e) => e.type === "BIRTHDAY")
        .map((e) => ({
          name: e.employeeName,
          dateStr: new Date(d.date).toLocaleDateString(undefined, { day: "numeric", month: "short" }),
        }))
    );
  }, [calendarData]);

  // 3. Gather anniversaries of the month
  const anniversaryList = useMemo(() => {
    if (!calendarData?.days) return [];
    return calendarData.days.flatMap((d) =>
      (d.events || [])
        .filter((e) => e.type === "ANNIVERSARY")
        .map((e) => ({
          name: e.employeeName,
          dateStr: new Date(d.date).toLocaleDateString(undefined, { day: "numeric", month: "short" }),
        }))
    );
  }, [calendarData]);

  // 4. Group into Categories (Holidays first, then Birthdays, then Anniversaries)
  const categories = useMemo(() => {
    const res: Array<{ type: "HOLIDAY" | "BIRTHDAY" | "ANNIVERSARY"; items: Array<{ title: string; dateStr: string }> }> = [];

    if (holidays.length > 0) {
      res.push({
        type: "HOLIDAY",
        items: holidays.map((h) => ({
          title: h.holidayName || h.offReason || "Holiday",
          dateStr: h.date ? new Date(h.date).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" }) : "",
        })),
      });
    }

    if (birthdayList.length > 0) {
      res.push({
        type: "BIRTHDAY",
        items: birthdayList.map((b) => ({
          title: `${b.name}'s Birthday`,
          dateStr: b.dateStr,
        })),
      });
    }

    if (anniversaryList.length > 0) {
      res.push({
        type: "ANNIVERSARY",
        items: anniversaryList.map((a) => ({
          title: `${a.name}'s Work Anniversary`,
          dateStr: a.dateStr,
        })),
      });
    }

    return res;
  }, [holidays, birthdayList, anniversaryList]);

  // Reset pointers if categories change
  useEffect(() => {
    setCatIndex(0);
    setItemIndex(0);
  }, [categories.length]);

  // Auto-slide effect (every 5 seconds)
  useEffect(() => {
    if (categories.length === 0) return;
    const interval = setInterval(() => {
      const currentCat = categories[catIndex];
      if (!currentCat) return;

      if (itemIndex < currentCat.items.length - 1) {
        // Step 2: Slide item within current category
        setItemIndex((prev) => prev + 1);
      } else {
        // Step 3: Slide to next Category Card
        setCatIndex((prevCat) => (prevCat + 1) % categories.length);
        setItemIndex(0);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [categories, catIndex, itemIndex]);

  const handleNextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (categories.length === 0) return;
    const currentCat = categories[catIndex];
    if (!currentCat) return;

    if (itemIndex < currentCat.items.length - 1) {
      setItemIndex((prev) => prev + 1);
    } else {
      setCatIndex((prevCat) => (prevCat + 1) % categories.length);
      setItemIndex(0);
    }
  };

  const handlePrevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (categories.length === 0) return;
    const currentCat = categories[catIndex];
    if (!currentCat) return;

    if (itemIndex > 0) {
      setItemIndex((prev) => prev - 1);
    } else {
      const newCatIndex = (catIndex - 1 + categories.length) % categories.length;
      setCatIndex(newCatIndex);
      setItemIndex(categories[newCatIndex].items.length - 1);
    }
  };

  const currentMonthLabel = calendarData
    ? new Date(calendarData.year, calendarData.month - 1).toLocaleString("en-US", { month: "long" })
    : new Date().toLocaleString("en-US", { month: "long" });

  if (loading && !calendarData) {
    return (
      <Card sx={{ p: 3, display: "flex", justifyContent: "center", alignItems: "center", minHeight: 145 }}>
        <CircularProgress size={28} sx={{ color: "#6D5DF6" }} />
      </Card>
    );
  }

  if (error) {
    return null;
  }

  const currentCategory = categories[catIndex] || categories[0];
  const slideConf = currentCategory ? TYPE_CONFIGS[currentCategory.type] : TYPE_CONFIGS.HOLIDAY;
  const currentItem = currentCategory?.items[itemIndex];

  // Dynamic Pagination Window for Indicators in Current Category (Max 5 dots)
  const totalCategoryItems = currentCategory?.items.length || 0;
  const maxVisible = 5;
  let startDot = itemIndex - 2;
  let endDot = itemIndex + 2;
  if (startDot < 0) {
    startDot = 0;
    endDot = Math.min(totalCategoryItems - 1, maxVisible - 1);
  } else if (endDot >= totalCategoryItems) {
    endDot = totalCategoryItems - 1;
    startDot = Math.max(0, totalCategoryItems - maxVisible);
  }
  const visibleDotIndices: number[] = [];
  for (let i = startDot; i <= endDot; i++) {
    visibleDotIndices.push(i);
  }

  return (
    <Card
      sx={{
        p: 1.5,
        backgroundColor: "#FFFFFF",
        border: "1px solid #E2E8F0",
        borderRadius: "16px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Static Overlay arrows */}
      {categories.length > 0 && (
        <Box sx={{ position: "absolute", right: 24, top: 24, display: "flex", gap: 0.5, zIndex: 10 }}>
          <IconButton size="small" onClick={handlePrevSlide} sx={{ color: slideConf.iconColor, backgroundColor: "rgba(255,255,255,0.7)", p: 0.4, "&:hover": { backgroundColor: "#FFFFFF" } }}>
            <ChevronLeftIcon sx={{ fontSize: 16 }} />
          </IconButton>
          <IconButton size="small" onClick={handleNextSlide} sx={{ color: slideConf.iconColor, backgroundColor: "rgba(255,255,255,0.7)", p: 0.4, "&:hover": { backgroundColor: "#FFFFFF" } }}>
            <ChevronRightIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      )}

      {categories.length === 0 ? (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 130 }}>
          <Typography variant="body2" sx={{ color: "#64748B", fontWeight: 600, textAlign: "center" }}>
            No scheduled events for this month
          </Typography>
        </Box>
      ) : (
        /* Tier 1: Entire Category Card slides in when catIndex changes */
        <Box
          key={`cat-${catIndex}`}
          sx={{
            p: 2.2,
            borderRadius: "12px",
            background: slideConf.bg,
            border: slideConf.border,
            minHeight: 130,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            animation: `${cardSlideIn} 0.45s cubic-bezier(0.25, 1, 0.5, 1)`,
          }}
        >
          {/* Stationary Header inside Category Card */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {currentCategory.type === "HOLIDAY" && <CalendarMonthIcon sx={{ color: slideConf.iconColor, fontSize: 18 }} />}
            {currentCategory.type === "BIRTHDAY" && <CakeIcon sx={{ color: slideConf.iconColor, fontSize: 18 }} />}
            {currentCategory.type === "ANNIVERSARY" && <WorkspacePremiumIcon sx={{ color: slideConf.iconColor, fontSize: 18 }} />}
            
            <Typography variant="caption" sx={{ color: slideConf.subColor, fontWeight: 700, fontSize: "0.7rem", tracking: "0.05em", textTransform: "uppercase" }}>
              {currentCategory.type}
            </Typography>
          </Box>

          {/* Tier 2: Item Content fades in when itemIndex changes */}
          <Box
            key={`item-${catIndex}-${itemIndex}`}
            sx={{
              my: 0.5,
              animation: `${itemFadeIn} 0.4s ease-in-out`,
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: 800, color: slideConf.textColor, pr: 6, fontSize: "1.05rem" }}>
              {currentItem?.title}
            </Typography>
          </Box>

          {/* Stationary Footer inside Category Card */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1 }}>
            {/* Stationary Date & View All button */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box key={`date-${catIndex}-${itemIndex}`} sx={{ animation: `${itemFadeIn} 0.4s ease-in-out` }}>
                <Typography variant="caption" sx={{ color: slideConf.iconColor, fontWeight: 700, display: "flex", alignItems: "center", gap: 0.5 }}>
                  📅 {currentItem?.dateStr}
                </Typography>
              </Box>
              {currentCategory.type === "HOLIDAY" && holidays.length > 0 && (
                <Button
                  size="small"
                  onClick={() => setAllHolidaysOpen(true)}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    color: slideConf.iconColor,
                    fontSize: "0.75rem",
                    p: 0,
                    minWidth: 0,
                    textDecoration: "underline",
                    "&:hover": { backgroundColor: "transparent", textDecoration: "underline" },
                  }}
                >
                  View All Holidays
                </Button>
              )}
            </Box>

            {/* Stationary Indicator Dots inside Category Card */}
            {totalCategoryItems > 1 && (
              <Box sx={{ display: "flex", gap: 0.6, alignItems: "center" }}>
                {visibleDotIndices.map((idx) => {
                  const isActive = idx === itemIndex;
                  const isLeftEdge = idx === visibleDotIndices[0] && idx > 0;
                  const isRightEdge = idx === visibleDotIndices[visibleDotIndices.length - 1] && idx < totalCategoryItems - 1;
                  const isEdge = isLeftEdge || isRightEdge;

                  const dotWidth = isActive ? 12 : isEdge ? 4 : 6;
                  const dotHeight = isActive ? 5 : isEdge ? 4 : 5;
                  const dotOpacity = isActive ? 1 : isEdge ? 0.35 : 0.65;

                  return (
                    <Box
                      key={idx}
                      onClick={() => setItemIndex(idx)}
                      sx={{
                        width: dotWidth,
                        height: dotHeight,
                        borderRadius: "3px",
                        backgroundColor: isActive ? slideConf.iconColor : slideConf.subColor,
                        opacity: dotOpacity,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    />
                  );
                })}
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* View All Holidays Dialog Modal */}
      <Dialog
        open={allHolidaysOpen}
        onClose={() => setAllHolidaysOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: { sx: { borderRadius: 3, p: 1 } },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, pt: 2, pb: 1 }}>
          <DialogTitle sx={{ fontWeight: 800, fontSize: "1.1rem", p: 0, display: "flex", alignItems: "center", gap: 1 }}>
            <CalendarMonthIcon sx={{ color: "#4F46E5" }} />
            Holidays — {currentMonthLabel}
          </DialogTitle>
          <IconButton onClick={() => setAllHolidaysOpen(false)} sx={{ color: "#94A3B8" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <DialogContent sx={{ px: 2, pb: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 1.5 }}>
            {holidays.map((h, index) => (
              <Box
                key={index}
                sx={{
                  p: 1.8,
                  borderRadius: 2,
                  border: "1px solid #E2E8F0",
                  backgroundColor: "#F8FAFC",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "#0F172A" }}>
                    {h.holidayName || h.offReason || "Holiday"}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748B" }}>
                    {new Date(h.date).toLocaleDateString(undefined, { weekday: "long" })}
                  </Typography>
                </Box>
                <Chip
                  label={new Date(h.date).toLocaleDateString(undefined, { day: "numeric", month: "short" })}
                  size="small"
                  sx={{
                    backgroundColor: "#EEF2FF",
                    color: "#4F46E5",
                    fontWeight: 700,
                  }}
                />
              </Box>
            ))}
          </Box>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
