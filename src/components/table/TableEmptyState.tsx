import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import SearchOffOutlinedIcon from "@mui/icons-material/SearchOffOutlined";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";

export interface TableEmptyStateProps {
  title?: string;
  description?: string;
  isSearch?: boolean;
  onClearSearch?: () => void;
  actionText?: string;
  onAction?: () => void;
  icon?: ReactNode;
}

export function TableEmptyState({
  title,
  description,
  isSearch = false,
  onClearSearch,
  actionText,
  onAction,
  icon,
}: TableEmptyStateProps) {
  const defaultTitle = isSearch ? "No matching records found" : "No records available";
  const defaultDescription = isSearch
    ? "Try adjusting your search criteria or clearing applied filters."
    : "There are currently no items in this list.";

  return (
    <Box
      sx={{
        py: 6,
        px: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          backgroundColor: "#F1F5F9",
          color: "#94A3B8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 2,
        }}
      >
        {icon || (isSearch ? <SearchOffOutlinedIcon sx={{ fontSize: 28 }} /> : <InboxOutlinedIcon sx={{ fontSize: 28 }} />)}
      </Box>

      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#1E293B", mb: 0.5 }}>
        {title || defaultTitle}
      </Typography>

      <Typography variant="body2" sx={{ color: "#64748B", maxWidth: 360, mb: 2 }}>
        {description || defaultDescription}
      </Typography>

      {isSearch && onClearSearch && (
        <Button
          variant="outlined"
          size="small"
          onClick={onClearSearch}
          sx={{
            textTransform: "none",
            borderRadius: "8px",
            borderColor: "#CBD5E1",
            color: "#475569",
            fontWeight: 600,
            "&:hover": {
              borderColor: "#94A3B8",
              backgroundColor: "#F8FAFC",
            },
          }}
        >
          Clear Filters
        </Button>
      )}

      {!isSearch && actionText && onAction && (
        <Button
          variant="contained"
          size="small"
          onClick={onAction}
          sx={{
            textTransform: "none",
            borderRadius: "8px",
            backgroundColor: "#6D5DF6",
            fontWeight: 600,
            "&:hover": {
              backgroundColor: "#5B4BEA",
            },
          }}
        >
          {actionText}
        </Button>
      )}
    </Box>
  );
}

export default TableEmptyState;
