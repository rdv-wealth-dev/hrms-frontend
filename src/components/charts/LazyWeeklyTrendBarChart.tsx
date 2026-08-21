import { lazy, Suspense, type ComponentProps } from "react";
import Skeleton from "@mui/material/Skeleton";
import Card from "@mui/material/Card";

const WeeklyTrendBarChart = lazy(() => import("./WeeklyTrendBarChart"));

function ChartSkeleton() {
  return (
    <Card
      elevation={0}
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 3.5,
        backgroundColor: "#FFFFFF",
        border: "1px solid rgba(0,0,0,0.04)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
        height: 380,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Skeleton variant="text" width="40%" height={32} />
      <Skeleton variant="rounded" width="100%" height={260} sx={{ borderRadius: 2 }} />
    </Card>
  );
}

export default function LazyWeeklyTrendBarChart(
  props: ComponentProps<typeof WeeklyTrendBarChart>
) {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <WeeklyTrendBarChart {...props} />
    </Suspense>
  );
}
