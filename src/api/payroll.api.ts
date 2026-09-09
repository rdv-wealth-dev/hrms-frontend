import axios from "./axios";
import type {
  SalaryComponentItem,
  StructureTemplateItem,
} from "../types/payroll.types";

export async function getSalaryComponents(): Promise<SalaryComponentItem[]> {
  try {
    const response = await axios.get("/payroll/components");
    return response.data;
  } catch (error) {
    console.warn("GET /payroll/components API call failed, using mock fallback", error);
    throw error;
  }
}

export async function createSalaryComponent(
  data: Omit<SalaryComponentItem, "id">
): Promise<SalaryComponentItem> {
  try {
    const response = await axios.post("/payroll/components", data);
    return response.data;
  } catch (error) {
    console.warn("POST /payroll/components API call failed, local state fallback active", error);
    throw error;
  }
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
