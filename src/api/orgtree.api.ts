import axiosInstance from "./axios";

export type MatrixRelationshipType =
  | "CODE_REVIEW"
  | "MATRIX_PROJECT"
  | "FUNCTIONAL_APPROVER"
  | "PEER_REVIEW"
  | string;

export interface CreateWorkRoutePayload {
  fromNodeId: string;
  toNodeId: string;
  relationshipType: MatrixRelationshipType;
  projectName?: string;
  notes?: string;
}

export interface WorkRouteItem {
  id?: string;
  _id?: string;
  fromNodeId: string;
  toNodeId: string;
  relationshipType: MatrixRelationshipType;
  projectName?: string;
  notes?: string;
  isActive?: boolean;
}

export interface OrgTreeNode {
  id: string;
  _id?: string;
  title: string;
  cSuiteRole?: string;
  assignedEmployee?: {
    _id?: string;
    fullName?: string;
    email?: string;
    employeeCode?: string;
    avatarUrl?: string;
  };
  children?: OrgTreeNode[];
}

export interface CreateWorkRouteResponse {
  success?: boolean;
  message?: string;
  data?: WorkRouteItem;
}

export interface OrgHierarchyResponse {
  success?: boolean;
  data?: OrgTreeNode[];
}

/**
 * Configures a Matrix Work / Code Review Submission Route
 * POST /org-tree/work-routes
 */
export const createWorkRoute = async (
  payload: CreateWorkRoutePayload
): Promise<CreateWorkRouteResponse> => {
  const { data } = await axiosInstance.post<CreateWorkRouteResponse>(
    "/org-tree/work-routes",
    payload
  );
  return data;
};

/**
 * Fetches company top-level hierarchy org chart
 * GET /org-tree/hierarchy
 */
export const getOrgHierarchy = async (): Promise<OrgHierarchyResponse> => {
  const { data } = await axiosInstance.get<OrgHierarchyResponse>("/org-tree/hierarchy");
  return data;
};
