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

export interface OrgTreeNodeAssignedEmployee {
  _id?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  employeeCode?: string;
  avatarUrl?: string;
  designationTitle?: string;
  departmentName?: string;
  status?: string;
}

export interface OrgTreeNode {
  id: string;
  _id?: string;
  title: string;
  code?: string;
  cSuiteRole?: string;
  levelTier?: number;
  levelName?: string;
  isVacant?: boolean;
  department?: {
    _id?: string;
    name?: string;
    code?: string;
    color?: string;
  } | null;
  assignedEmployee?: OrgTreeNodeAssignedEmployee | null;
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

export interface ReparentNodePayload {
  nodeId: string;
  newParentId: string | null;
}

export interface ReparentNodeResponse {
  success?: boolean;
  message?: string;
  data?: {
    nodeId: string;
    nodeTitle?: string;
    previousParent?: string;
    newParent?: string;
    updatedAt?: string;
  };
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

/**
 * Reparents a node/subtree under a new parent node in the org tree
 * PATCH /org-tree/reparent
 */
export const reparentOrgNode = async (
  payload: ReparentNodePayload
): Promise<ReparentNodeResponse> => {
  const { data } = await axiosInstance.patch<ReparentNodeResponse>(
    "/org-tree/reparent",
    payload
  );
  return data;
};
