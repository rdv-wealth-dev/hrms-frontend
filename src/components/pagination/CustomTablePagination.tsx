import TablePagination from "@mui/material/TablePagination";

interface CustomTablePaginationProps {
  count: number;
  rowsPerPage: number;
  page: number; // 1-indexed (matching state/API pageNumber)
  onPageChange: (newPage: number) => void; // Returns 1-indexed page
  onRowsPerPageChange: (newRowsPerPage: number) => void;
  rowsPerPageOptions?: number[];
}

export default function CustomTablePagination({
  count,
  rowsPerPage,
  page,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [5, 10, 25],
}: CustomTablePaginationProps) {
  if (count <= 0) return null;

  const validOptions = Array.from(new Set([...rowsPerPageOptions, rowsPerPage, 50])).sort((a, b) => a - b);

  return (
    <TablePagination
      rowsPerPageOptions={validOptions}
      component="div"
      count={count}
      rowsPerPage={rowsPerPage}
      page={Math.max(0, page - 1)} // Convert 1-indexed to 0-indexed for Material-UI
      onPageChange={(_, newPage) => onPageChange(newPage + 1)} // Convert 0-indexed back to 1-indexed
      onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
      sx={{
        borderTop: "1px solid rgba(224, 224, 224, 1)",
        "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
          fontSize: "13px",
        },
      }}
    />
  );
}
