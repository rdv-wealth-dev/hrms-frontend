import { useRef, type ReactNode } from "react";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import type { SxProps, Theme } from "@mui/material/styles";
import VirtualizedTableBody from "./VirtualizedTableBody";
import type { VirtualItem } from "../../hooks/useTableVirtualizer";

export interface VirtualizedTableColumn<T = any> {
  id: string;
  header: string | ReactNode;
  width?: number | string;
  minWidth?: number | string;
  align?: "left" | "center" | "right";
  cell?: (item: T, index: number) => ReactNode;
  sticky?: "left" | "right";
}

export interface VirtualizedTableProps<T> {
  columns: VirtualizedTableColumn<T>[];
  data: T[];
  renderRow?: (item: T, index: number, virtualItem: VirtualItem) => ReactNode;
  rowKey?: (item: T, index: number) => string | number;
  maxHeight?: number | string;
  minWidth?: number | string;
  estimateRowHeight?: number;
  overscan?: number;
  loading?: boolean;
  stickyHeader?: boolean;
  emptyState?: ReactNode;
  onRowClick?: (item: T) => void;
  sx?: SxProps<Theme>;
  containerSx?: SxProps<Theme>;
}

/**
 * VirtualizedTable
 * High-performance, self-contained virtualized data table for enterprise HRMS datasets.
 * Includes sticky headers, responsive horizontal scroll, loading skeletons, and empty state fallbacks.
 */
export function VirtualizedTable<T>({
  columns = [],
  data = [],
  renderRow,
  rowKey,
  maxHeight = 580,
  minWidth = 750,
  estimateRowHeight = 56,
  overscan = 5,
  loading = false,
  stickyHeader = true,
  emptyState,
  onRowClick,
  sx,
  containerSx,
}: VirtualizedTableProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const safeData = Array.isArray(data) ? data : [];

  const defaultRenderRow = (item: T, index: number, _vItem: VirtualItem) => {
    const key = rowKey ? rowKey(item, index) : (item as any)?.id || (item as any)?._id || index;
    const isClickable = Boolean(onRowClick);

    return (
      <TableRow
        key={String(key)}
        hover
        onClick={isClickable ? () => onRowClick?.(item) : undefined}
        sx={{
          height: estimateRowHeight,
          cursor: isClickable ? "pointer" : "default",
          transition: "background-color 0.15s ease",
          "&:hover": {
            backgroundColor: "#F8FAFC",
          },
          "& td": {
            borderColor: "#F1F5F9",
            fontSize: "13.5px",
            color: "#334155",
            py: 1.2,
          },
        }}
      >
        {columns.map((col) => {
          const content = col.cell ? col.cell(item, index) : (item as any)?.[col.id];
          return (
            <TableCell
              key={col.id}
              align={col.align || "left"}
              sx={{
                width: col.width,
                minWidth: col.minWidth,
                ...(col.sticky === "left" && {
                  position: "sticky",
                  left: 0,
                  backgroundColor: "#FFFFFF",
                  zIndex: 2,
                }),
                ...(col.sticky === "right" && {
                  position: "sticky",
                  right: 0,
                  backgroundColor: "#FFFFFF",
                  zIndex: 2,
                }),
              }}
            >
              {content}
            </TableCell>
          );
        })}
      </TableRow>
    );
  };

  return (
    <Card
      sx={{
        borderRadius: "16px",
        border: "1px solid #E2E8F0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
        overflow: "hidden",
        backgroundColor: "#FFFFFF",
        ...sx,
      }}
    >
      <TableContainer
        ref={containerRef}
        sx={{
          maxHeight,
          overflowY: "auto",
          overflowX: "auto",
          scrollbarWidth: "thin",
          scrollbarColor: "#CBD5E1 transparent",
          "&::-webkit-scrollbar": {
            width: "6px",
            height: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#CBD5E1",
            borderRadius: "6px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#94A3B8",
          },
          ...containerSx,
        }}
      >
        <Table stickyHeader={stickyHeader} sx={{ minWidth }}>
          <TableHead>
            <TableRow
              sx={{
                "& th": {
                  backgroundColor: "#F8FAFC",
                  color: "#475569",
                  fontWeight: 700,
                  fontSize: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  borderColor: "#E2E8F0",
                  py: 1.6,
                  zIndex: 3,
                },
              }}
            >
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  align={col.align || "left"}
                  sx={{
                    width: col.width,
                    minWidth: col.minWidth,
                    ...(col.sticky === "left" && {
                      position: "sticky",
                      left: 0,
                      backgroundColor: "#F8FAFC",
                      zIndex: 4,
                    }),
                    ...(col.sticky === "right" && {
                      position: "sticky",
                      right: 0,
                      backgroundColor: "#F8FAFC",
                      zIndex: 4,
                    }),
                  }}
                >
                  {col.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <VirtualizedTableBody
            items={safeData}
            renderRow={renderRow || defaultRenderRow}
            containerRef={containerRef}
            estimateRowHeight={estimateRowHeight}
            overscan={overscan}
            loading={loading}
            columnsCount={columns.length || 1}
            emptyState={emptyState}
          />
        </Table>
      </TableContainer>
    </Card>
  );
}

export default VirtualizedTable;
