import { useState, useCallback } from "react";

interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
}

export function usePagination(options?: UsePaginationOptions) {
  const [pageNumber, setPageNumber] = useState(options?.initialPage ?? 1);
  const [pageSize, setPageSize] = useState(options?.initialPageSize ?? 10);

  const handlePageChange = useCallback((newPage: number) => {
    setPageNumber(newPage);
  }, []);

  const handleRowsPerPageChange = useCallback((newSize: number) => {
    setPageSize(newSize);
    setPageNumber(1); // Reset to page 1 on page size change
  }, []);

  return {
    pageNumber,
    pageSize,
    handlePageChange,
    handleRowsPerPageChange,
    setPageNumber,
  };
}
