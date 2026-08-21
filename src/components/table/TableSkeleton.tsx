import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";

export interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  rowHeight?: number;
  hasAvatar?: boolean;
}

export function TableSkeleton({
  rows = 5,
  columns = 5,
  rowHeight = 56,
  hasAvatar = true,
}: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <TableRow key={`skeleton-row-${rIdx}`} sx={{ height: rowHeight }}>
          {Array.from({ length: columns }).map((__, cIdx) => (
            <TableCell key={`skeleton-cell-${rIdx}-${cIdx}`} sx={{ py: 1.5 }}>
              {cIdx === 0 && hasAvatar ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Skeleton variant="circular" width={38} height={38} animation="wave" />
                  <Box sx={{ flexGrow: 1 }}>
                    <Skeleton variant="text" width="70%" height={18} animation="wave" />
                    <Skeleton variant="text" width="45%" height={14} animation="wave" />
                  </Box>
                </Box>
              ) : (
                <Skeleton
                  variant="rounded"
                  height={22}
                  width={cIdx === columns - 1 ? 60 : `${Math.floor(50 + (cIdx * 15) % 45)}%`}
                  animation="wave"
                  sx={{ borderRadius: "6px" }}
                />
              )}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

export default TableSkeleton;
