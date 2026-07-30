import { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import MenuItem from "@mui/material/MenuItem";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Alert from "@mui/material/Alert";

import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

import TextInput from "../../../components/input/TextInput";
import { addBankAccount, deleteBankAccount, type BankAccount, type AddBankAccountRequest } from "../../../api/employee.api";

interface PayrollTabProps {
  bankAccounts: BankAccount[];
  bankAccountsLoading: boolean;
  isViewingOther: boolean;
  employeeId: string | null;
  user: any;
  onRefreshProfileData: () => Promise<void>;
  showSnackbar: (msg: string, variant: "success" | "error" | "info" | "warning") => void;
}

export default function PayrollTab({
  bankAccounts,
  bankAccountsLoading,
  isViewingOther,
  employeeId,
  user,
  onRefreshProfileData,
  showSnackbar,
}: PayrollTabProps) {
  const [bankDialogOpen, setBankDialogOpen] = useState(false);
  const [bankSubmitting, setBankSubmitting] = useState(false);
  const [bankError, setBankError] = useState<string | null>(null);
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [accountType, setAccountType] = useState<AddBankAccountRequest["accountType"]>("SALARY");
  const [isPrimary, setIsPrimary] = useState(false);

  const [bankDeleteTarget, setBankDeleteTarget] = useState<BankAccount | null>(null);
  const [bankDeleting, setBankDeleting] = useState(false);

  const resetBankForm = () => {
    setBankName("");
    setAccountNumber("");
    setIfscCode("");
    setAccountType("SALARY");
    setIsPrimary(false);
    setBankError(null);
  };

  const handleAddBankAccount = async () => {
    if (!bankName.trim() || !accountNumber.trim() || !ifscCode.trim()) return;

    setBankSubmitting(true);
    setBankError(null);

    try {
      const response = await addBankAccount({
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        ifscCode: ifscCode.trim().toUpperCase(),
        accountType,
        isPrimary,
      });

      if (!response.succeeded) {
        setBankError(response.message || "Failed to add bank account");
        setBankSubmitting(false);
        return;
      }

      showSnackbar("Bank account added successfully", "success");
      setBankDialogOpen(false);
      resetBankForm();
      await onRefreshProfileData();
    } catch (err: unknown) {
      setBankError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBankSubmitting(false);
    }
  };

  const handleDeleteBankAccount = async () => {
    if (!bankDeleteTarget) return;
    setBankDeleting(true);
    setBankError(null);
    try {
      const bankId = bankDeleteTarget.id || bankDeleteTarget._id || "";
      const res = await deleteBankAccount(bankDeleteTarget.employeeId || user?.employeeId || employeeId || "", bankId);
      if (res.succeeded) {
        setBankDeleteTarget(null);
        showSnackbar("Bank account deleted successfully", "success");
        await onRefreshProfileData();
      } else {
        setBankError(res.message || "Failed to delete bank account");
      }
    } catch (err: unknown) {
      setBankError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBankDeleting(false);
    }
  };

  return (
    <Box>
      <Card sx={{ p: 3.5 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#0F172A", display: "flex", alignItems: "center", gap: 1 }}>
            <AccountBalanceOutlinedIcon sx={{ color: "#4F46E5" }} />
            Bank Accounts
          </Typography>
          {!isViewingOther && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => { resetBankForm(); setBankDialogOpen(true); }} sx={{ backgroundColor: "#4F46E5" }}>
              Add Bank Account
            </Button>
          )}
        </Box>
        {bankAccountsLoading ? (
          <Box sx={{ textAlign: "center", py: 4 }}><CircularProgress size={28} sx={{ color: "#4F46E5" }} /></Box>
        ) : bankAccounts.length === 0 ? (
          <Typography variant="body2" sx={{ color: "#64748B", textAlign: "center", py: 3 }}>No bank account added yet.</Typography>
        ) : (
          <Grid container spacing={2}>
            {bankAccounts.map((acc, index) => (
              <Grid key={acc.id || acc._id || index} size={{ xs: 12, sm: 6 }}>
                <Box sx={{ p: 2, borderRadius: 2, border: "1px solid #E2E8F0", backgroundColor: "#F8FAFC" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "#0F172A" }}>{acc.bankName}</Typography>
                    {!isViewingOther && (
                      <IconButton size="small" onClick={() => { setBankError(null); setBankDeleteTarget(acc); }}>
                        <DeleteOutlinedIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                  <Typography variant="caption" sx={{ color: "#64748B", fontFamily: "monospace", display: "block", mt: 0.5 }}>{acc.accountNumber}</Typography>
                  <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                    <Chip label={acc.ifscCode} size="small" variant="outlined" sx={{ fontSize: "0.7rem", fontFamily: "monospace" }} />
                    <Chip label={acc.accountType} size="small" variant="outlined" sx={{ fontSize: "0.7rem" }} />
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </Card>

      {/* Delete Bank Account Confirmation */}
      <Dialog
        open={!!bankDeleteTarget}
        onClose={() => { if (!bankDeleting) setBankDeleteTarget(null); }}
        maxWidth="xs"
        fullWidth
        slotProps={{
          backdrop: {
            sx: {
              backdropFilter: "blur(6px)",
              backgroundColor: "rgba(15, 23, 42, 0.4)",
            },
          },
          paper: { sx: { borderRadius: "16px", p: 1 } },
        }}
      >
        <DialogTitle component="div" sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#111827" }}>
            Delete Bank Account?
          </Typography>
          <IconButton onClick={() => setBankDeleteTarget(null)} size="small" sx={{ color: "#9CA3AF" }} disabled={bankDeleting}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ py: 2 }}>
          {bankError && <Alert severity="error" sx={{ mb: 2, borderRadius: "10px" }}>{bankError}</Alert>}
          <Typography variant="body2" sx={{ color: "#6B7280" }}>
            {bankDeleteTarget?.bankName} ({bankDeleteTarget?.accountNumber}) will be permanently removed. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setBankDeleteTarget(null)} disabled={bankDeleting} color="inherit">
            Cancel
          </Button>
          <Button
            type="button"
            variant="contained"
            onClick={handleDeleteBankAccount}
            disabled={bankDeleting}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              backgroundColor: "#DC2626",
              "&:hover": { backgroundColor: "#B91C1C" },
              px: 3,
            }}
          >
            {bankDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Bank Account Dialog */}
      <Dialog
        open={bankDialogOpen}
        onClose={() => { if (!bankSubmitting) setBankDialogOpen(false); }}
        maxWidth="sm"
        fullWidth
        slotProps={{
          backdrop: {
            sx: {
              backdropFilter: "blur(6px)",
              backgroundColor: "rgba(15, 23, 42, 0.4)",
            },
          },
          paper: { sx: { borderRadius: "16px", p: 1 } },
        }}
      >
        <DialogTitle component="div" sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#111827" }}>
            Add Bank Account
          </Typography>
          <IconButton onClick={() => setBankDialogOpen(false)} size="small" sx={{ color: "#9CA3AF" }} disabled={bankSubmitting}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, py: 2 }}>
          {bankError && <Alert severity="error" sx={{ borderRadius: "10px" }}>{bankError}</Alert>}
          <TextInput
            label="Bank Name"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            required
            disabled={bankSubmitting}
            placeholder="e.g. State Bank of India"
          />
          <TextInput
            label="Account Number"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            required
            disabled={bankSubmitting}
            placeholder="e.g. 1234567890"
          />
          <TextInput
            label="IFSC Code"
            value={ifscCode}
            onChange={(e) => setIfscCode(e.target.value)}
            required
            placeholder="e.g. SBIN0001234"
            disabled={bankSubmitting}
          />
          <TextInput
            select
            label="Account Type"
            value={accountType}
            onChange={(e) => setAccountType(e.target.value as AddBankAccountRequest["accountType"])}
            disabled={bankSubmitting}
          >
            <MenuItem value="SALARY">Salary</MenuItem>
            <MenuItem value="SAVINGS">Savings</MenuItem>
            <MenuItem value="CURRENT">Current</MenuItem>
          </TextInput>
          <FormControlLabel
            control={
              <Switch
                checked={isPrimary}
                onChange={(e) => setIsPrimary(e.target.checked)}
                disabled={bankSubmitting}
              />
            }
            label="Set as primary account"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setBankDialogOpen(false)}
            disabled={bankSubmitting}
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="contained"
            onClick={handleAddBankAccount}
            disabled={bankSubmitting || !bankName.trim() || !accountNumber.trim() || !ifscCode.trim()}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              backgroundColor: "#6D5DF6",
              "&:hover": { backgroundColor: "#5B4BE4" },
              px: 3,
            }}
          >
            {bankSubmitting ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
