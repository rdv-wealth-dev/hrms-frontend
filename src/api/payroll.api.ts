import axios from "./axios";
import type {
  SalaryComponentItem,
  StructureTemplateItem,
  CreateSalaryComponentPayload,
  CreatePtSlabsPayload,
  PtSlabConfigItem,
  InitiatePayrollRunRequest,
  InitiatePayrollRunResponse,
  PreflightValidationApiResponse,
  SaveWageInputsPayload,
  SaveWageInputsApiResponse,
  LockAttendancePayload,
  LockAttendanceApiResponse,
  CreatePayrollAdjustmentPayload,
  BulkCreatePayrollAdjustmentPayload,
  PayrollAdjustmentItem,
  GetAdjustmentsParams,
  PayrollAdjustmentListResponse,
  SaveSalaryHoldPayload,
  SaveSalaryHoldApiResponse,
  SaveTaxOverridePayload,
  SaveTaxOverrideApiResponse,
  BatchGeneratePayslipsPayload,
  BatchGeneratePayslipsApiResponse,
  GetRunPayslipsApiResponse,
} from "../types/payroll.types";

export async function initiatePayrollRun(
  payload: InitiatePayrollRunRequest
): Promise<InitiatePayrollRunResponse> {
  const response = await axios.post<InitiatePayrollRunResponse>(
    "/payroll/runs",
    payload
  );
  return response.data;
}

export async function getSalaryComponents(): Promise<SalaryComponentItem[]> {
  try {
    const response = await axios.get("/payroll/components");
    return response.data?.data ?? response.data;
  } catch (error) {
    console.warn("GET /payroll/components API call failed", error);
    throw error;
  }
}

export async function createSalaryComponent(
  payload: CreateSalaryComponentPayload
): Promise<SalaryComponentItem> {
  const response = await axios.post("/payroll/components", payload);
  return response.data?.data ?? response.data;
}

export async function saveProfessionalTaxSlabs(
  payload: CreatePtSlabsPayload
): Promise<PtSlabConfigItem> {
  const response = await axios.post("/payroll/statutory/pt", payload);
  return response.data?.data ?? response.data;
}

export async function getStructureTemplates(): Promise<StructureTemplateItem[]> {
  try {
    const response = await axios.get("/payroll/structures/templates");
    return response.data;
  } catch (error) {
    console.warn("GET /payroll/structures/templates API call failed, using mock fallback", error);
    throw error;
  }
}

export async function createStructureTemplate(
  data: Omit<StructureTemplateItem, "id">
): Promise<StructureTemplateItem> {
  try {
    const response = await axios.post("/payroll/structures/templates", data);
    return response.data;
  } catch (error) {
    console.warn("POST /payroll/structures/templates API call failed, local state fallback active", error);
    throw error;
  }
}

/**
 * POST /payroll/runs/:id/validate
 * Runs 7-point pre-flight validation on all active employees for the given payroll run.
 * No request body — payrollRunId is passed via the URL path.
 * Returns: { valid, totalChecked, errors[] } where errors[] is a flat array with
 * "CRITICAL:" and "WARNING" prefixes for categorisation on the frontend.
 */
export async function validatePayrollRun(
  payrollRunId: string
): Promise<PreflightValidationApiResponse> {
  const response = await axios.post<PreflightValidationApiResponse>(
    `/payroll/runs/${payrollRunId}/validate`
  );
  return response.data;
}

/**
 * POST /payroll/runs/:id/steps/wage-inputs
 * Saves variable wage-based inputs (hourly, daily, job-based) and overtime hours/amounts for a payroll run.
 */
export async function saveWageInputs(
  payrollRunId: string,
  payload: SaveWageInputsPayload
): Promise<SaveWageInputsApiResponse> {
  const response = await axios.post<SaveWageInputsApiResponse>(
    `/payroll/runs/${payrollRunId}/steps/wage-inputs`,
    payload
  );
  return response.data;
}

/**
 * POST /payroll/attendance-lock/lock
 * Locks attendance in backend for the given period & branch.
 */
export async function lockAttendancePeriod(
  payload: LockAttendancePayload
): Promise<LockAttendanceApiResponse> {
  const response = await axios.post<LockAttendanceApiResponse>(
    "/payroll/attendance-lock/lock",
    payload
  );
  return response.data;
}

/**
 * GET /payroll/attendance-lock/status/:year/:month
 * Checks lock status for the period & branch.
 */
export async function getAttendanceLockStatus(
  year: number,
  month: number,
  branchId?: string
): Promise<LockAttendanceApiResponse> {
  const params = branchId ? `?branchId=${branchId}` : "";
  const response = await axios.get<LockAttendanceApiResponse>(
    `/payroll/attendance-lock/status/${year}/${month}${params}`
  );
  return response.data;
}

/**
 * POST /payroll/adjustments
 * Creates a single variable pay / adjustment entry.
 */
export async function createPayrollAdjustment(
  payload: CreatePayrollAdjustmentPayload
): Promise<{ succeeded: boolean; message: string; data: PayrollAdjustmentItem }> {
  const response = await axios.post<{ succeeded: boolean; message: string; data: PayrollAdjustmentItem }>(
    "/payroll/adjustments",
    payload
  );
  return response.data;
}

/**
 * POST /payroll/adjustments/bulk
 * Bulk creates multiple adjustment entries.
 */
export async function bulkCreatePayrollAdjustments(
  payload: BulkCreatePayrollAdjustmentPayload
): Promise<{
  succeeded: boolean;
  message: string;
  data: {
    successCount: number;
    failureCount: number;
    created: PayrollAdjustmentItem[];
    errors: Array<{ index: number; employeeId: string; error: string }>;
  };
}> {
  const response = await axios.post(
    "/payroll/adjustments/bulk",
    payload
  );
  return response.data;
}

/**
 * GET /payroll/adjustments
 * Lists payroll adjustments with optional query filters (year, month, branchId, status, type, page, pageSize).
 */
export async function listPayrollAdjustments(
  params?: GetAdjustmentsParams
): Promise<{ succeeded: boolean; message: string; data: PayrollAdjustmentListResponse }> {
  const query = new URLSearchParams();
  if (params?.year) query.set("year", String(params.year));
  if (params?.month) query.set("month", String(params.month));
  if (params?.employeeId) query.set("employeeId", params.employeeId);
  if (params?.branchId) query.set("branchId", params.branchId);
  if (params?.status) query.set("status", params.status);
  if (params?.type) query.set("type", params.type);
  if (params?.page) query.set("page", String(params.page));
  if (params?.pageSize) query.set("pageSize", String(params.pageSize));

  const qs = query.toString() ? `?${query.toString()}` : "";
  const response = await axios.get<{ succeeded: boolean; message: string; data: PayrollAdjustmentListResponse }>(
    `/payroll/adjustments${qs}`
  );
  return response.data;
}

/**
 * DELETE /payroll/adjustments/:id
 * Removes a payroll adjustment.
 */
export async function deletePayrollAdjustment(
  id: string
): Promise<{ succeeded: boolean; message: string; data: null }> {
  const response = await axios.delete<{ succeeded: boolean; message: string; data: null }>(
    `/payroll/adjustments/${id}`
  );
  return response.data;
}

/**
 * PATCH /payroll/adjustments/:id/approve
 * Approves a payroll adjustment so it is factored into payslips.
 */
export async function approvePayrollAdjustment(
  id: string
): Promise<{ succeeded: boolean; message: string; data: PayrollAdjustmentItem }> {
  const response = await axios.patch<{ succeeded: boolean; message: string; data: PayrollAdjustmentItem }>(
    `/payroll/adjustments/${id}/approve`
  );
  return response.data;
}

/**
 * POST /payroll/runs/:id/steps/hold-salary
 * Saves the list of employees whose salary payouts are placed on hold for this run.
 */
export async function saveSalaryHoldStep(
  payrollRunId: string,
  payload: SaveSalaryHoldPayload
): Promise<SaveSalaryHoldApiResponse> {
  const response = await axios.post<SaveSalaryHoldApiResponse>(
    `/payroll/runs/${payrollRunId}/steps/hold-salary`,
    payload
  );
  return response.data;
}

/**
 * POST /payroll/runs/:id/steps/tax-override
 * Saves manual tax overrides (Income Tax / TDS and Professional Tax) for this payroll run.
 */
export async function saveTaxOverrideStep(
  payrollRunId: string,
  payload: SaveTaxOverridePayload
): Promise<SaveTaxOverrideApiResponse> {
  const response = await axios.post<SaveTaxOverrideApiResponse>(
    `/payroll/runs/${payrollRunId}/steps/tax-override`,
    payload
  );
  return response.data;
}

/**
 * POST /payroll/runs/:id/generate-batch
 * Triggers full 20-step statutory & net calculation engine across all active employees in this run.
 */
export async function generateBatchPayslips(
  payrollRunId: string,
  payload: BatchGeneratePayslipsPayload
): Promise<BatchGeneratePayslipsApiResponse> {
  const response = await axios.post<BatchGeneratePayslipsApiResponse>(
    `/payroll/runs/${payrollRunId}/generate-batch`,
    payload
  );
  return response.data;
}

/**
 * GET /payroll/runs/:id/payslips
 * Fetches the generated pay register (all computed payslips) for this run.
 */
export async function getRunPayslips(
  payrollRunId: string
): Promise<GetRunPayslipsApiResponse> {
  const response = await axios.get<GetRunPayslipsApiResponse>(
    `/payroll/runs/${payrollRunId}/payslips`
  );
  return response.data;
}
