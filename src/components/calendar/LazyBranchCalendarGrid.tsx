import { lazy, Suspense, type ComponentProps } from "react";
import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";

const BranchCalendarGrid = lazy(() =>
  import("./BranchCalendarGrid").then((m) => ({ default: m.BranchCalendarGrid }))
);

function CalendarSkeleton() {
  return (
    <Box sx={{ width: "100%", py: 1 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Skeleton variant="text" width="30%" height={32} />
        <Skeleton variant="rectangular" width="20%" height={32} sx={{ borderRadius: 1.5 }} />
      </Box>
      <Skeleton variant="rounded" width="100%" height={320} sx={{ borderRadius: 2.5 }} />
    </Box>
  );
}

export function LazyBranchCalendarGrid(
  props: ComponentProps<typeof BranchCalendarGrid>
) {
  return (
    <Suspense fallback={<CalendarSkeleton />}>
      <BranchCalendarGrid {...props} />
    </Suspense>
  );
}

export default LazyBranchCalendarGrid;
