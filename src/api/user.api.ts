import axiosInstance from "./axios";

export interface UserAccountData {
  _id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  employeeId?: string;
  branchIds: string[];
}

export interface UserResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: {
    id: string;
    email: string;
    role: string;
    branchIds: string[];
  };
}

export interface ListUsersResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: UserAccountData[];
}

export const listUsers = async (): Promise<UserAccountData[]> => {
  const response = await axiosInstance.get<ListUsersResponse>("/users");
  return response.data.data;
};

export const updateUserRole = async (
  userId: string,
  role: string,
  branchIds: string[] = []
): Promise<UserResponse> => {
  const payload = {
    role,
    branchIds: role === "BRANCH_ADMIN" ? branchIds : [],
  };
  const response = await axiosInstance.patch<UserResponse>(
    `/users/${userId}/role`,
    payload
  );
  return response.data;
};
