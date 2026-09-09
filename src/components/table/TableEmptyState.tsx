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
          backgroundColor: "action.hover",
          color: "text.secondary",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 2,
        }}
      >
        {icon || (isSearch ? <SearchOffOutlinedIcon sx={{ fontSize: 28 }} /> : <InboxOutlinedIcon sx={{ fontSize: 28 }} />)}
      </Box>

      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "text.primary", mb: 0.5 }}>
        {title || defaultTitle}
      </Typography>

      <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 360, mb: 2 }}>
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
            borderColor: "divider",
            color: "text.secondary",
            fontWeight: 600,
            "&:hover": {
              borderColor: "primary.main",
              backgroundColor: "action.hover",
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
            bgcolor: "primary.main",
            color: "primary.contrastText",
            fontWeight: 600,
            "&:hover": {
              bgcolor: "primary.dark",
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
