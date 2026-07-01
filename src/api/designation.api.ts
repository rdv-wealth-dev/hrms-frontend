import axiosInstance from "./axios";

import type {
    CreateDesignationRequest,
    UpdateDesignationRequest,
    DesignationResponse,
    DesignationListResponse,
} from "../auth/types";

// const getAuthHeader = () => {
//     const token = localStorage.getItem("accessToken");

//     if (!token) {
//         throw new Error("No access token found. Please log in again.");
//     }

//     return {
//         Authorization: `Bearer ${token}`,
//     };
// };

export const createDesignation = async (
    payload: CreateDesignationRequest
): Promise<DesignationResponse> => {
    const response = await axiosInstance.post<DesignationResponse>(
        "/designations",
        payload,
        { headers: getAuthHeader() }
    );
    return response.data;
};

export const listDesignations = async (
    pageNumber = 1,
    pageSize = 10
): Promise<DesignationListResponse> => {
    const response = await axiosInstance.get<DesignationListResponse>(
        `/designations?pageNumber=${pageNumber}&pageSize=${pageSize}`,
        { headers: getAuthHeader() }
    );
    return response.data;
};

export const getDesignationById = async (
    id: string
): Promise<DesignationResponse> => {
    const response = await axiosInstance.get<DesignationResponse>(
        `/designations/${id}`,
        { headers: getAuthHeader() }
    );
    return response.data;
};

// ✅ New
export const updateDesignation = async (
    id: string,
    payload: UpdateDesignationRequest
): Promise<DesignationResponse> => {
    const response = await axiosInstance.patch<DesignationResponse>(
        `/designations/${id}`,
        payload,
        { headers: getAuthHeader() }
    );
    return response.data;
};