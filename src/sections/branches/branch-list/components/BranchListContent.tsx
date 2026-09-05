import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

import type { AppDispatch } from "../../../../store/store";
import type { RootState } from "../../../../store/rootReducer";
import {
  listBranchesRequest,
  createBranchRequest,
  resetBranchStatus,
  getHeadOfficeRequest,
  updateBranchRequest,
  deleteBranchRequest,
} from "../../../../store/branch";
import { usePermissions } from "../../../../hooks/usePermissions";
import { useDialog } from "../../../../hooks/useDialog";
import { useSubmitSuccess } from "../../../../hooks/useSubmitSuccess";
import { useSnackbar } from "../../../../components/snackbar";
import BranchFormDialog from "./BranchFormDialog";
import BranchCalendarDialog from "./BranchCalendarDialog";
import SeedBranchDialog from "./SeedBranchDialog";
import { useActiveBranchId } from "../../../../hooks/useActiveBranchId";
import type { Branch, CreateBranchRequest } from "../../../../store/branch/branch.types";

function BranchListContent() {
  const dispatch = useDispatch<AppDispatch>();
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission("branch.create");
  const canUpdate = hasPermission("branch.update");
  const canDelete = hasPermission("branch.delete");

  const { branches, headOffice, loading, submitting, success, error } = useSelector(
    (state: RootState) => state.branch
  );

  const activeBranchId = useActiveBranchId();
  const [currentBranchId, setCurrentBranchId] = useState<string>("");

  useEffect(() => {
    if (activeBranchId && !currentBranchId) {
      setCurrentBranchId(activeBranchId);
    }
  }, [activeBranchId, currentBranchId]);

  const selectedBranch = branches.find((b) => b._id === currentBranchId) || headOffice || branches[0];

  const { showSnackbar } = useSnackbar();
  const formDialog = useDialog<Branch>();
  const deleteDialog = useDialog<Branch>();
  const calendarDialog = useDialog<Branch>();
  const seedDialog = useDialog<Branch>();

  useEffect(() => {
    dispatch(listBranchesRequest());
    dispatch(getHeadOfficeRequest());
  }, [dispatch]);

  useEffect(() => {
    if (error && error !== "Head office not found") {
      showSnackbar(error, "error");
    }
  }, [error, showSnackbar]);

  useSubmitSuccess({
    submitting,
    success,
    error,
    onSuccess: () => {
      if (formDialog.isOpen) {
        formDialog.close();
        dispatch(listBranchesRequest());
        dispatch(getHeadOfficeRequest());
      }
      if (deleteDialog.isOpen) {
        deleteDialog.close();
        dispatch(listBranchesRequest());
        dispatch(getHeadOfficeRequest());
      }
    },
  });

  const handleOpenCreate = () => {
    dispatch(resetBranchStatus());
    formDialog.open();
  };

  const handleOpenEdit = (branch: Branch) => {
    dispatch(resetBranchStatus());
    formDialog.open(branch);
  };

  const handleOpenDelete = (branch: Branch) => {
    dispatch(resetBranchStatus());
    deleteDialog.open(branch);
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.target) {
      dispatch(deleteBranchRequest(deleteDialog.target._id));
    }
  };

  const handleCreateSubmit = (data: CreateBranchRequest) => {
    if (formDialog.target) {
      dispatch(updateBranchRequest(formDialog.target._id, data));
    } else {
      dispatch(createBranchRequest(data));
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
          mb: 4,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <ApartmentOutlinedIcon sx={{ fontSize: 36, color: "primary.main" }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Branches
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Overview and configuration of all organization branches
            </Typography>
          </Box>
        </Box>

        {canCreate && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            sx={{
              backgroundColor: "primary.main",
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              "&:hover": { backgroundColor: "primary.dark" },
            }}
          >
            Add Branch
          </Button>
        )}
      </Box>

      {/* Selected Active Branch Highlight Card */}
      {selectedBranch && (
        <Paper
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            background: "linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)",
            color: "#fff",
            boxShadow: "0px 8px 30px rgba(49, 46, 129, 0.15)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {canUpdate && (
            <IconButton
              size="small"
              onClick={() => handleOpenEdit(selectedBranch)}
              sx={{
                position: "absolute",
                top: 16,
                right: 16,
                color: "rgba(255, 255, 255, 0.6)",
                "&:hover": { color: "#fff", backgroundColor: "rgba(255,255,255,0.08)" },
                zIndex: 10,
              }}
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          )}
          {/* Decorative background circle */}
          <Box
            sx={{
              position: "absolute",
              right: -50,
              bottom: -50,
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.03)",
            }}
          />

          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 3 }}>
            <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ApartmentOutlinedIcon sx={{ fontSize: 40, color: "#A5B4FC" }} />
              </Box>
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: "#fff" }}>
                    {selectedBranch.name}
                  </Typography>
                  <Chip
                    label={selectedBranch.isHeadOffice ? "Primary Headquarters" : "Assigned Branch"}
                    size="small"
                    sx={{
                      backgroundColor: selectedBranch.isHeadOffice
                        ? "rgba(165, 180, 252, 0.2)"
                        : "rgba(165, 180, 252, 0.15)",
                      color: "#E0E7FF",
                      fontWeight: 700,
                      fontSize: 10,
                      height: 20,
                    }}
                  />
                </Box>
                <Typography variant="body2" sx={{ color: "#C7D2FE", mt: 0.5, fontWeight: 500 }}>
                  {selectedBranch.isHeadOffice ? "HQ" : "Branch"} Code: {selectedBranch.code}
                </Typography>

                {/* Location address */}
                {selectedBranch.address && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mt: 2 }}>
                    <LocationOnOutlinedIcon sx={{ fontSize: 16, color: "#A5B4FC" }} />
                    <Typography variant="body2" sx={{ color: "#E0E7FF", fontSize: 13 }}>
                      {[
                        selectedBranch.address.addressLine1,
                        selectedBranch.address.addressLine2,
                        selectedBranch.address.city,
                        selectedBranch.address.state,
                        selectedBranch.address.zip,
                        selectedBranch.address.countryCode,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Right section: Policies */}
            <Box
              sx={{
                display: "flex",
                gap: { xs: 2, sm: 4 },
                flexWrap: "wrap",
                backgroundColor: "rgba(255, 255, 255, 0.04)",
                p: 2,
                borderRadius: 2.5,
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              {selectedBranch.workPolicy?.timezone && (
                <Box>
                  <Typography variant="caption" sx={{ color: "#818CF8", display: "block", fontWeight: 700, textTransform: "uppercase" }}>
                    Timezone
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#fff", mt: 0.5 }}>
                    {selectedBranch.workPolicy.timezone}
                  </Typography>
                </Box>
              )}

              {selectedBranch.workPolicy?.workingHoursPerDay !== undefined && (
                <Box>
                  <Typography variant="caption" sx={{ color: "#818CF8", display: "block", fontWeight: 700, textTransform: "uppercase" }}>
                    Working Hours
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#fff", mt: 0.5 }}>
                    {selectedBranch.workPolicy.workingHoursPerDay} hrs / day
                  </Typography>
                </Box>
              )}

              {selectedBranch.workPolicy?.weeklyOffDays && selectedBranch.workPolicy.weeklyOffDays.length > 0 && (
                <Box>
                  <Typography variant="caption" sx={{ color: "#818CF8", display: "block", fontWeight: 700, textTransform: "uppercase" }}>
                    Weekly Offs
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#fff", mt: 0.5 }}>
                    {selectedBranch.workPolicy.weeklyOffDays.join(", ")}
                  </Typography>
                </Box>
              )}

              {(selectedBranch.contact?.email || selectedBranch.contact?.phone) && (
                <Box sx={{ width: "100%", height: "1px", backgroundColor: "rgba(255, 255, 255, 0.08)", my: 0.5 }} />
              )}

              {selectedBranch.contact?.email && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mr: 2 }}>
                  <EmailOutlinedIcon sx={{ fontSize: 16, color: "#A5B4FC" }} />
                  <Typography variant="body2" sx={{ color: "#E0E7FF", fontSize: 13 }}>
                    {selectedBranch.contact.email}
                  </Typography>
                </Box>
              )}

              {selectedBranch.contact?.phone && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <PhoneOutlinedIcon sx={{ fontSize: 16, color: "#A5B4FC" }} />
                  <Typography variant="body2" sx={{ color: "#E0E7FF", fontSize: 13 }}>
                    {selectedBranch.contact.phone}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Paper>
      )}

      {/* Loading & Error States */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 5 }}>
          <CircularProgress size={40} sx={{ color: "primary.main" }} />
        </Box>
      )}

      {!loading && branches.length === 0 && (
        <Paper
          sx={{
            p: 5,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            borderRadius: 2,
            border: "1px dashed rgba(0,0,0,0.12)",
            boxShadow: "none",
          }}
        >
          <ApartmentOutlinedIcon sx={{ fontSize: 48, color: "text.disabled" }} />
          <Typography variant="h6" sx={{ color: "text.secondary" }}>
            No branches found
          </Typography>
          <Typography variant="body2" sx={{ color: "text.disabled", maxWidth: 320 }}>
            There are no branches defined for this tenant yet.
          </Typography>
        </Paper>
      )}

      {!loading && !error && branches.length > 0 && (
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 3,
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
            border: "1px solid rgba(0,0,0,0.06)",
            width: "100%",
            maxWidth: "100%",
            overflowX: "auto",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
            WebkitOverflowScrolling: "touch",
          }}
        >
          <Table sx={{ width: "100%", tableLayout: "auto" }}>
            <TableHead sx={{ backgroundColor: "rgba(109, 93, 246, 0.05)" }}>
              <TableRow>
                <TableCell align="left" sx={{ fontWeight: 650, whiteSpace: "nowrap" }}>Branch Name</TableCell>
                <TableCell align="center" sx={{ fontWeight: 650 }}>Location</TableCell>
                <TableCell align="left" sx={{ fontWeight: 650 }}>Contact Details</TableCell>
                <TableCell align="center" sx={{ fontWeight: 650 }}>Work Policy</TableCell>

                <TableCell align="center" sx={{ fontWeight: 650, whiteSpace: "nowrap" }}>Status</TableCell>
                <TableCell align="center" sx={{ fontWeight: 650, whiteSpace: "nowrap" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {branches.map((branch) => {
                const address = branch.address;
                const contact = branch.contact;
                const workPolicy = branch.workPolicy;
                const statutory = branch.statutory;

                const addressString = [
                  address?.addressLine1,
                  address?.addressLine2,
                  address?.city,
                  address?.state,
                  address?.zip,
                  address?.countryCode,
                ]
                  .filter(Boolean)
                  .join(", ");

                const isSelected = branch._id === currentBranchId;

                return (
                  <TableRow
                    key={branch._id}
                    hover
                    sx={{
                      transition: "all 0.2s ease",
                      ...(isSelected && {
                        backgroundColor: "rgba(109, 93, 246, 0.04) !important",
                      }),
                    }}
                  >
                    {/* Branch Info */}
                    <TableCell
                      sx={{
                        transition: "all 0.2s ease",
                        ...(isSelected && {
                          borderLeft: "4px solid",
                          borderLeftColor: "primary.main",
                          pl: "12px !important",
                        }),
                      }}
                    >
                      <Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {branch.name}
                          </Typography>
                          {branch.isHeadOffice && (
                            <Chip
                              label="HQ"
                              size="small"
                              sx={{
                                backgroundColor: "rgba(76, 175, 80, 0.12)",
                                color: "#2e7d32",
                                fontWeight: 700,
                                fontSize: 10,
                                height: 18,
                              }}
                            />
                          )}
                        </Box>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          Code: {branch.code}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Location */}
                    <TableCell align="center" sx={{ maxWidth: 260, wordBreak: "break-word" }}>
                      {addressString ? (
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.8 }}>
                          <LocationOnOutlinedIcon sx={{ fontSize: 16, color: "text.disabled", flexShrink: 0 }} />
                          <Typography variant="body2" sx={{ color: "text.secondary", fontSize: 13, wordBreak: "break-word", textAlign: "center" }}>
                            {addressString}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" sx={{ color: "text.disabled", fontStyle: "italic", fontSize: 13, textAlign: "center" }}>
                          No address specified
                        </Typography>
                      )}
                    </TableCell>

                    {/* Contact Details */}
                    <TableCell>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                        {contact?.email && (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                            <EmailOutlinedIcon sx={{ fontSize: 14, color: "text.disabled" }} />
                            <Typography variant="body2" sx={{ fontSize: 13, color: "text.secondary" }}>
                              {contact.email}
                            </Typography>
                          </Box>
                        )}
                        {contact?.phone && (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                            <PhoneOutlinedIcon sx={{ fontSize: 14, color: "text.disabled" }} />
                            <Typography variant="body2" sx={{ fontSize: 13, color: "text.secondary" }}>
                              {contact.phone}
                            </Typography>
                          </Box>
                        )}
                        {!contact?.email && !contact?.phone && (
                          <Typography variant="body2" sx={{ color: "text.disabled", fontStyle: "italic", fontSize: 13 }}>
                            No contact details
                          </Typography>
                        )}
                      </Box>
                    </TableCell>

                    {/* Work Policy */}
                    <TableCell align="center">
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, alignItems: "center", textAlign: "center" }}>
                        {workPolicy?.timezone && (
                          <Typography variant="body2" sx={{ fontSize: 12, color: "text.secondary" }}>
                            <strong>TZ:</strong> {workPolicy.timezone}
                          </Typography>
                        )}
                        {workPolicy?.workingHoursPerDay !== undefined && (
                          <Typography variant="body2" sx={{ fontSize: 12, color: "text.secondary" }}>
                            <strong>Hours/Day:</strong> {workPolicy.workingHoursPerDay} hrs
                          </Typography>
                        )}
                        {workPolicy?.weeklyOffDays && workPolicy.weeklyOffDays.length > 0 && (
                          <Typography variant="body2" sx={{ fontSize: 12, color: "text.secondary" }}>
                            <strong>Weekly Offs:</strong> {workPolicy.weeklyOffDays.join(", ")}
                          </Typography>
                        )}
                        {workPolicy?.customWeekOffRules && workPolicy.customWeekOffRules.length > 0 && (
                          <Typography variant="body2" sx={{ fontSize: 12, color: "#4F46E5", fontWeight: 600 }}>
                            <strong>Custom Offs:</strong>{" "}
                            {workPolicy.customWeekOffRules
                              .map((r) => `${r.dayOfWeek.slice(0, 3)} (${r.weeks.join(", ")})`)
                              .join("; ")}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>

                    {/* Statutory Details */}
                    <TableCell align="center">
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, alignItems: "center", textAlign: "center" }}>
                        <Typography variant="body2" sx={{ fontSize: 12, color: "text.secondary" }}>
                          <strong>PF:</strong> {statutory?.pfApplicable ? "Yes" : "No"}
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: 12, color: "text.secondary" }}>
                          <strong>ESI:</strong> {statutory?.esiApplicable ? "Yes" : "No"}
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: 12, color: "text.secondary" }}>
                          <strong>PT:</strong> {statutory?.ptApplicable ? "Yes" : "No"}{statutory?.ptStateCode ? ` (${statutory.ptStateCode})` : ""}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Status */}
                    <TableCell align="center">
                      <Chip
                        label={branch.isActive ? "Active" : "Inactive"}
                        size="small"
                        color={branch.isActive ? "success" : "default"}
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="right">
                      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
                        <IconButton
                          size="small"
                          onClick={() => calendarDialog.open(branch)}
                          sx={{ color: "primary.main", "&:hover": { backgroundColor: "primary.lighter" } }}
                          title="View Branch Calendar"
                        >
                          <CalendarMonthIcon fontSize="small" />
                        </IconButton>

                        {canUpdate && (
                          <>
                            <IconButton
                              size="small"
                              onClick={() => seedDialog.open(branch)}
                              sx={{ color: "primary.main", "&:hover": { backgroundColor: "primary.lighter" } }}
                              title="Seed Master Data (Leave Types & Shifts)"
                            >
                              <AutoAwesomeIcon fontSize="small" />
                            </IconButton>

                            <IconButton
                              size="small"
                              onClick={() => handleOpenEdit(branch)}
                              sx={{ color: "primary.main" }}
                              title="Edit Branch"
                            >
                              <EditOutlinedIcon fontSize="small" />
                            </IconButton>
                          </>
                        )}
                        {canDelete && (
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDelete(branch)}
                            sx={{ color: "error.main", "&:hover": { backgroundColor: "rgba(211, 47, 47, 0.04)" } }}
                            title="Delete Branch"
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Seed Branch Master Data Dialog */}
      <SeedBranchDialog
        open={seedDialog.isOpen}
        branch={seedDialog.target}
        onClose={seedDialog.close}
        onSuccess={() => {
          dispatch(listBranchesRequest());
          dispatch(getHeadOfficeRequest());
        }}
      />

      {/* Branch Calendar Dialog */}
      <BranchCalendarDialog
        open={calendarDialog.isOpen}
        branchId={calendarDialog.target?._id || calendarDialog.target?.branchId || null}
        branchName={calendarDialog.target?.name}
        onClose={calendarDialog.close}
      />

      {/* Form Dialog */}
      <BranchFormDialog
        open={formDialog.isOpen}
        mode={formDialog.target ? "update" : "create"}
        initialValues={formDialog.target}
        submitting={submitting}
        error={error}
        onClose={formDialog.close}
        onSubmit={handleCreateSubmit}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 1, color: "error.main" }}>
          Delete Branch
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
            Are you sure you want to delete the branch <strong>{deleteDialog.target?.name}</strong> ({deleteDialog.target?.code})?
          </Typography>
          <Typography variant="caption" sx={{ color: "error.main", display: "block", fontWeight: 600 }}>
            ⚠️ Warning: This action cannot be undone and will permanently remove this branch and all its settings.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={deleteDialog.close} disabled={submitting} variant="outlined" color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            disabled={submitting}
            variant="contained"
            color="error"
            sx={{
              fontWeight: 600,
              boxShadow: "none",
              "&:hover": { backgroundColor: "#d32f2f", boxShadow: "none" }
            }}
          >
            {submitting ? (
              <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
            ) : null}
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default BranchListContent;
