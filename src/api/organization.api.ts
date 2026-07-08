import axiosInstance from "./axios";
import type {
  GetOrganizationResponse,
  UpdateOrganizationRequest,
  UpdateOrganizationResponse,
} from "../store/organization/organization.types";

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("accessToken") ?? ""}`,
});

export const getOrganization = async (): Promise<GetOrganizationResponse> => {
  const response = await axiosInstance.get<GetOrganizationResponse>(
    "/organizations/me",
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const updateOrganization = async (
  payload: UpdateOrganizationRequest
): Promise<UpdateOrganizationResponse> => {
  const response = await axiosInstance.patch<UpdateOrganizationResponse>(
    "/organizations/me",
    payload,
    { headers: getAuthHeader() }
  );
  return response.data;
};
