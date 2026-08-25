import axiosInstance from "./axios";

export interface SystemPermissionItem {
  module: string;
  action: string;
  resource: string;
  description: string;
}

export interface GetPermissionsResponse {
  success: boolean;
  data: {
    total: number;
    permissions: SystemPermissionItem[];
    groupedByModule: Record<string, SystemPermissionItem[]>;
  };
}

export interface RoleItem {
  _id: string;
  id?: string;
  tenantId?: string;
  name: string;
  slug: string;
  description?: string;
  permissions?: string[];
  isSystemRole?: boolean;
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ListRolesResponse {
  success?: boolean;
  message?: string;
  data?: RoleItem[];
}

export interface SingleRoleResponse {
  success?: boolean;
  message?: string;
  data?: RoleItem;
}

export interface CreateRoleRequest {
  name: string;
  slug: string;
  description?: string;
  permissions: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissions?: string[];
  isActive?: boolean;
}

/**
 * Fetch all available system permissions grouped by module
 * GET /roles/permissions
 */
export const getSystemPermissions = async (): Promise<GetPermissionsResponse> => {
  const { data } = await axiosInstance.get<GetPermissionsResponse>("/roles/permissions");
  return data;
};

/**
 * List all active roles for the organization
 * GET /roles
 */
export const listRoles = async (): Promise<ListRolesResponse> => {
  const { data } = await axiosInstance.get<ListRolesResponse>("/roles");
  return data;
};

/**
 * Get a single role by ID
 * GET /roles/:id
 */
export const getRoleById = async (roleId: string): Promise<SingleRoleResponse> => {
  const { data } = await axiosInstance.get<SingleRoleResponse>(`/roles/${roleId}`);
  return data;
};

/**
 * Create a new custom role
 * POST /roles
 */
export const createRole = async (payload: CreateRoleRequest): Promise<SingleRoleResponse> => {
  const { data } = await axiosInstance.post<SingleRoleResponse>("/roles", payload);
  return data;
};

/**
 * Update an existing custom role
 * PUT /roles/:id
 */
export const updateRole = async (roleId: string, payload: UpdateRoleRequest): Promise<SingleRoleResponse> => {
  const { data } = await axiosInstance.put<SingleRoleResponse>(`/roles/${roleId}`, payload);
  return data;
};

/**
 * Delete a custom role
 * DELETE /roles/:id
 */
export const deleteRole = async (roleId: string): Promise<{ success: boolean; message: string }> => {
  const { data } = await axiosInstance.delete<{ success: boolean; message: string }>(`/roles/${roleId}`);
  return data;
};

