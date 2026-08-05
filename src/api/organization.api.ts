import axiosInstance from "./axios";
import type {
  GetOrganizationResponse,
  UpdateOrganizationRequest,
  UpdateOrganizationResponse,
  UpdateModulesRequest,
  UpdateModulesResponse,
  UpdateStatutoryRequest,
  UpdateStatutoryResponse,
} from "../store/organization/organization.types";

export const getOrganization = async (): Promise<GetOrganizationResponse> => {
  const response = await axiosInstance.get<GetOrganizationResponse>("/organizations/me");
  return response.data;
};

export const updateOrganization = async (
  payload: UpdateOrganizationRequest
): Promise<UpdateOrganizationResponse> => {
  const response = await axiosInstance.patch<UpdateOrganizationResponse>(
    "/organizations/me",
    payload
  );
  return response.data;
};

export const updateModules = async (
  payload: UpdateModulesRequest
): Promise<UpdateModulesResponse> => {
  const response = await axiosInstance.patch<UpdateModulesResponse>(
    "/organizations/me/modules",
    payload
  );
  return response.data;
};

export const updateStatutory = async (
  payload: UpdateStatutoryRequest
): Promise<UpdateStatutoryResponse> => {
  const response = await axiosInstance.patch<UpdateStatutoryResponse>(
    "/organizations/me/statutory",
    payload
  );
  return response.data;
};

export const updateMandatoryDocs = async (
  payload: { mandatoryDocumentTypes: string[] }
): Promise<UpdateOrganizationResponse> => {
  const response = await axiosInstance.patch<UpdateOrganizationResponse>(
    "/organizations/me/mandatory-docs",
    payload
  );
  return response.data;
};
