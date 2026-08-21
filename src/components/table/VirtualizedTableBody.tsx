import type { ReactNode, RefObject } from "react";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import { useTableVirtualizer, type VirtualItem } from "../../hooks/useTableVirtualizer";
import TableSkeleton from "./TableSkeleton";
import TableEmptyState from "./TableEmptyState";

export interface VirtualizedTableBodyProps<T> {
  items: T[];
  renderRow: (item: T, index: number, virtualItem: VirtualItem) => ReactNode;
  containerRef: RefObject<HTMLElement | null>;
  estimateRowHeight?: number | ((index: number) => number);
  overscan?: number;
  loading?: boolean;
  columnsCount?: number;
  emptyState?: React.ReactNode;
}

/**
 * VirtualizedTableBody
 * Drop-in virtualized TableBody replacement for MUI <Table>.
 * Renders only the visible rows inside the scrolling container + overscan buffer.
 */
export function VirtualizedTableBody<T>({
  items,
  renderRow,
  containerRef,
  estimateRowHeight = 56,
  overscan = 5,
  loading = false,
  columnsCount = 6,
  emptyState,
}: VirtualizedTableBodyProps<T>) {
  const safeItems = Array.isArray(items) ? items : [];

  const { virtualItems, paddingTop, paddingBottom } = useTableVirtualizer({
    count: safeItems.length,
    estimateSize: estimateRowHeight,
    overscan,
    containerRef,
  });

  if (loading) {
    return (
      <TableBody>
        <TableSkeleton
          rows={6}
          columns={columnsCount}
          rowHeight={typeof estimateRowHeight === "number" ? estimateRowHeight : 56}
        />
      </TableBody>
    );
  }

  if (safeItems.length === 0) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={columnsCount} sx={{ py: 4, textAlign: "center", borderBottom: 0 }}>
            {emptyState || <TableEmptyState />}
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <TableBody>
      {/* Top Spacer */}
      {paddingTop > 0 && (
        <TableRow
          aria-hidden="true"
          sx={{
            height: `${paddingTop}px !important`,
            border: "none !important",
            p: "0 !important",
            "& td": { p: "0 !important", border: "none !important", height: `${paddingTop}px !important` },
          }}
        >
          <TableCell colSpan={columnsCount} sx={{ p: 0, border: "none" }} />
        </TableRow>
      )}

      {/* Render Virtualized Rows */}
      {virtualItems.map((vItem) => {
        const item = safeItems[vItem.index];
        if (item === undefined) return null;
        return renderRow(item, vItem.index, vItem);
      })}

      {/* Bottom Spacer */}
      {paddingBottom > 0 && (
        <TableRow
          aria-hidden="true"
          sx={{
            height: `${paddingBottom}px !important`,
            border: "none !important",
            p: "0 !important",
            "& td": { p: "0 !important", border: "none !important", height: `${paddingBottom}px !important` },
          }}
        >
          <TableCell colSpan={columnsCount} sx={{ p: 0, border: "none" }} />
        </TableRow>
      )}
    </TableBody>
  );
}

export default VirtualizedTableBody;
