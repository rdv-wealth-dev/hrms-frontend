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

const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("No access token found. Please log in again.");
  }
  return {
    Authorization: `Bearer ${token}`,
  };
};

export interface ListUsersResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: UserAccountData[];
}

export const listUsers = async (): Promise<UserAccountData[]> => {
  const response = await axiosInstance.get<ListUsersResponse>("/users", {
    headers: getAuthHeader(),
  });
  return response.data.data;
};

export const updateUserRole = async (
  userId: string,
  role: string
): Promise<UserResponse> => {
  const response = await axiosInstance.patch<UserResponse>(
    `/users/${userId}/role`,
    { role },
    { headers: getAuthHeader() }
  );
  return response.data;
};
