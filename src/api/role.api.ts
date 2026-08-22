import axiosInstance from "./axios";

export interface RoleItem {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  description?: string;
  permissions?: string[];
  isSystemRole?: boolean;
}

export interface ListRolesResponse {
  success?: boolean;
  message?: string;
  data?: RoleItem[];
}

/**
 * List all active roles for the organization
 * GET /roles
 */
export const listRoles = async (): Promise<ListRolesResponse> => {
  const { data } = await axiosInstance.get<ListRolesResponse>("/roles");
  return data;
};
