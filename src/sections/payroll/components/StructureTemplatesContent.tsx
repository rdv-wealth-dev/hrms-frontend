import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

import PrimaryButton from "../../../components/button/PrimaryButton";
import type { StructureTemplateItem } from "../../../types/payroll.types";
import CreateStructureTemplateDialog from "./CreateStructureTemplateDialog";

const DEFAULT_TEMPLATES: StructureTemplateItem[] = [];

interface StructureTemplatesContentProps {
  data?: StructureTemplateItem[];
}

export function StructureTemplatesContent({
  data = DEFAULT_TEMPLATES,
}: StructureTemplatesContentProps) {
  const [templatesList, setTemplatesList] = useState<StructureTemplateItem[]>(data ?? []);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });

  useEffect(() => {
    if (data && data.length > 0) {
      setTemplatesList(data);
    }
  }, [data]);

  const handleCreateTemplate = (newTemplateData: Omit<StructureTemplateItem, "id">) => {
    const newTemplate: StructureTemplateItem = {
      ...newTemplateData,
      id: `struct-${Date.now()}`,
    };

    setTemplatesList((prev) => [newTemplate, ...prev]);
    setToast({
      open: true,
      message: `Structure template "${newTemplateData.title}" created successfully!`,
    });
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
      {/* 1. Header & Action Row */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
        }}
      >
        <Box
          component="span"
          sx={{
            display: "inline-block",
            px: 1,
            py: 0.25,
            borderRadius: 1,
            border: "1px solid",
            borderColor: "error.main",
            color: "error.main",
            fontFamily: "monospace",
            fontSize: "0.75rem",
            fontWeight: 600,
          }}
        >
          GET/POST /payroll/structures/templates
        </Box>

        <Box sx={{ width: { xs: "100%", sm: "auto" } }}>
          <PrimaryButton onClick={() => setIsAddDialogOpen(true)}>
            Create Structure +
          </PrimaryButton>
        </Box>
      </Box>

      {/* 2. Templates Grid */}
      {templatesList.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: "center",
            borderRadius: 3,
            border: "1px dashed",
            borderColor: "divider",
            backgroundColor: "background.paper",
          }}
        >
          <Typography variant="body1" sx={{ fontWeight: 600, color: "text.primary", mb: 0.5 }}>
            No Structure Templates Created
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Click <strong>"Create Structure +"</strong> above to build a salary structure blueprint.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {templatesList.map((template) => (
          <Grid key={template?.id} size={{ xs: 12, md: 6 }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, sm: 3 },
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                backgroundColor: "background.paper",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                boxSizing: "border-box",
              }}
            >
              {/* Tags */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                {template?.tags?.map((tag) => (
                  <Box
                    key={tag?.label}
                    component="span"
                    sx={{
                      display: "inline-block",
                      px: 0.9,
                      py: 0.25,
                      borderRadius: 1,
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      letterSpacing: "0.5px",
                      textTransform: "uppercase",
                      ...(tag?.variant === "filled"
                        ? {
                            backgroundColor: "action.hover",
                            color: "error.main",
                            border: "1px solid",
                            borderColor: "divider",
                          }
                        : {
                            backgroundColor: "transparent",
                            color: "error.main",
                            border: "1px solid",
                            borderColor: "error.light",
                          }),
                    }}
                  >
                    {tag?.label}
                  </Box>
                ))}
              </Box>

              {/* Title & Description */}
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: "text.primary",
                  mb: 0.75,
                }}
              >
                {template?.title}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  lineHeight: 1.5,
                  mb: 3,
                }}
              >
                {template?.description}
              </Typography>

              {/* Earnings Section */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 700,
                    color: "text.primary",
                    mb: 1,
                    fontSize: "0.875rem",
                  }}
                >
                  Earnings
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  {template?.earnings?.map((item) => (
                    <Box
                      key={item?.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        py: 0.75,
                        borderBottom: "1px solid",
                        borderColor: "divider",
                        "&:last-child": { borderBottom: 0 },
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: "monospace",
                          fontWeight: 600,
                          fontSize: "0.8125rem",
                          color: "text.primary",
                        }}
                      >
                        {item?.name}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.8125rem",
                          color: "text.secondary",
                        }}
                      >
                        {item?.calculation}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Deductions Section */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 700,
                    color: "text.primary",
                    mb: 1,
                    fontSize: "0.875rem",
                  }}
                >
                  Deductions
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  {template?.deductions?.map((item) => (
                    <Box
                      key={item?.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        py: 0.75,
                        borderBottom: "1px solid",
                        borderColor: "divider",
                        "&:last-child": { borderBottom: 0 },
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: "monospace",
                          fontWeight: 600,
                          fontSize: "0.8125rem",
                          color: "text.primary",
                        }}
                      >
                        {item?.name}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.8125rem",
                          color: "text.secondary",
                        }}
                      >
                        {item?.calculation}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Footer: Employees Assigned */}
              <Box
                sx={{
                  mt: "auto",
                  pt: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                  color: "text.secondary",
                }}
              >
                <PersonOutlineOutlinedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    fontSize: "0.75rem",
                  }}
                >
                  {template?.assignedEmployeesCount ?? 0} employees assigned
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
      )}

      {/* Create Structure Template Dialog */}
      <CreateStructureTemplateDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleCreateTemplate}
      />

      {/* Toast Notification */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          severity="success"
          sx={{ width: "100%", fontWeight: 600 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default StructureTemplatesContent;
