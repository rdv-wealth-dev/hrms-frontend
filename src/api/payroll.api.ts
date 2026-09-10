import axios from "./axios";
import type {
  SalaryComponentItem,
  StructureTemplateItem,
  CreateSalaryComponentPayload,
  CreatePtSlabsPayload,
  PtSlabConfigItem,
  InitiatePayrollRunRequest,
  InitiatePayrollRunResponse,
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
