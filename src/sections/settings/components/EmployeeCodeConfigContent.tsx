import { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";

import TextInput from "../../../components/input/TextInput";
import PrimaryButton from "../../../components/button/PrimaryButton";
import { useSnackbar } from "../../../components/snackbar";
import { usePermissions } from "../../../hooks/usePermissions";
import { useSubmitSuccess } from "../../../hooks/useSubmitSuccess";
import type { RootState } from "../../../store/rootReducer";
import type { AppDispatch } from "../../../store/store";
import {
  loadOrganizationRequest,
  resetOrganizationStatus,
  updateEmployeeCodeConfigRequest,
} from "../../../store/organization";
import {
  employeeCodeConfigSchema,
  type EmployeeCodeConfigFormValues,
  type EmployeeCodeConfigValues,
} from "../../../validations/organization/employee-code-config.schema";

const DEFAULT_CONFIG: EmployeeCodeConfigValues = {
  prefix: "EMP",
  separator: "",
  digits: 2,
  startSequenceNumber: 1,
};

function EmployeeCodeConfigContent() {
  const dispatch = useDispatch<AppDispatch>();
  const { showSnackbar } = useSnackbar();
  const { hasPermission } = usePermissions();
  const canUpdate = hasPermission("settings.update");
  const { organization, loading, submitting, success, error } = useSelector(
    (state: RootState) => state.organization
  );

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm<EmployeeCodeConfigFormValues, unknown, EmployeeCodeConfigValues>({
    resolver: zodResolver(employeeCodeConfigSchema),
    defaultValues: DEFAULT_CONFIG,
    mode: "onBlur",
  });

  useEffect(() => {
    dispatch(loadOrganizationRequest());
    return () => {
      dispatch(resetOrganizationStatus());
    };
  }, [dispatch]);

  useEffect(() => {
    const config = organization?.employeeCodeConfig;
    if (!config) return;

    reset({
      prefix: config?.prefix ?? DEFAULT_CONFIG.prefix,
      separator: config?.separator ?? DEFAULT_CONFIG.separator,
      digits: config?.digits ?? DEFAULT_CONFIG.digits,
      startSequenceNumber:
        config?.startSequenceNumber ?? DEFAULT_CONFIG.startSequenceNumber,
    });
  }, [organization?.employeeCodeConfig, reset]);

  const handleSuccessfulSubmit = useCallback(() => {
    showSnackbar(
      "Employee code configuration updated successfully",
      "success"
    );
    dispatch(resetOrganizationStatus());
  }, [dispatch, showSnackbar]);

  useSubmitSuccess({
    submitting,
    success,
    error,
    onSuccess: handleSuccessfulSubmit,
  });

  const prefix = useWatch({ control, name: "prefix" });
  const separator = useWatch({ control, name: "separator" });
  const digits = useWatch({ control, name: "digits" });
  const startSequenceNumber = useWatch({
    control,
    name: "startSequenceNumber",
  });

  const preview = useMemo(() => {
    const safePrefix = String(prefix ?? "").trim().toUpperCase() || "EMP";
    const safeSeparator = String(separator ?? "").slice(0, 3);
    const parsedDigits = Number(digits);
    const safeDigits = Number.isInteger(parsedDigits)
      ? Math.min(8, Math.max(1, parsedDigits))
      : 2;
    const parsedSequence = Number(startSequenceNumber);
    const safeSequence = Number.isInteger(parsedSequence) && parsedSequence > 0
      ? parsedSequence
      : 1;

    return `${safePrefix}${safeSeparator}${String(safeSequence).padStart(
      safeDigits,
      "0"
    )}`;
  }, [digits, prefix, separator, startSequenceNumber]);

  const onSubmit = (values: EmployeeCodeConfigValues) => {
    if (!canUpdate) return;
    dispatch(updateEmployeeCodeConfigRequest(values));
  };

  if (loading) {
    return (
      <Box
        sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}
      >
        <CircularProgress size={40} sx={{ color: "primary.main" }} />
      </Box>
    );
  }

  if (!organization) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Alert severity={error ? "error" : "info"} sx={{ borderRadius: 2.5 }}>
          {error ?? "No organization settings found."}
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      sx={{ p: { xs: 2, sm: 3, md: 3.5 } }}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2.5 }}>
          {error}
        </Alert>
      )}

      {!canUpdate && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2.5 }}>
          You can view this configuration, but you do not have permission to update it.
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 2,
          }}
        >
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: "primary.lighter",
              color: "primary.main",
              display: "flex",
              flexShrink: 0,
            }}
          >
            <BadgeOutlinedIcon sx={{ fontSize: { xs: 27, sm: 32 } }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 750, fontSize: { xs: "1rem", sm: "1.25rem" } }}
            >
              Employee Code Configuration
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Define the format used to generate codes for new employees.
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={{ xs: 2, sm: 2.5 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              label="Prefix"
              required
              placeholder="EMP"
              format="uppercase"
              maxLength={15}
              disabled={!canUpdate || submitting}
              registration={register("prefix")}
              error={errors.prefix?.message}
              tooltip="Text shown at the beginning of every employee code"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              label="Separator"
              placeholder="-"
              maxLength={3}
              disabled={!canUpdate || submitting}
              registration={register("separator")}
              error={errors.separator?.message}
              tooltip="Up to three characters between the prefix and number"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              label="Number of digits"
              type="number"
              min={1}
              disabled={!canUpdate || submitting}
              registration={register("digits", { valueAsNumber: true })}
              error={errors.digits?.message}
              inputProps={{ max: 8, step: 1 }}
              tooltip="Numeric part width, padded with leading zeros (1 to 8)"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              label="Starting sequence number"
              type="number"
              min={1}
              disabled={!canUpdate || submitting}
              registration={register("startSequenceNumber", { valueAsNumber: true })}
              error={errors.startSequenceNumber?.message}
              inputProps={{ step: 1 }}
              tooltip="First counter used when generating a new employee code"
            />
          </Grid>

          <Grid size={12}>
            <Box
              sx={{
                mt: { xs: 0.5, sm: 1 },
                p: { xs: 2, sm: 2.5 },
                borderRadius: 2.5,
                backgroundColor: "primary.lighter",
                border: "1px dashed",
                borderColor: "primary.light",
                overflow: "hidden",
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                EMPLOYEE CODE PREVIEW
              </Typography>
              <Typography
                sx={{
                  mt: 0.5,
                  color: "primary.main",
                  fontWeight: 800,
                  fontSize: { xs: "1.35rem", sm: "1.65rem" },
                  overflowWrap: "anywhere",
                }}
              >
                {preview}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {canUpdate && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              mt: 3,
              width: { xs: "100%", sm: "auto" },
            }}
          >
            <Box sx={{ width: { xs: "100%", sm: 220 } }}>
              <PrimaryButton
                type="submit"
                loading={submitting}
                disabled={!isDirty}
              >
                Save Configuration
              </PrimaryButton>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default EmployeeCodeConfigContent;
