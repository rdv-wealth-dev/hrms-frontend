import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute =
      error.config?.url?.includes("/auth/login") ||
      error.config?.url?.includes("/auth/logout");

    const errorCode = error.response?.data?.errorCode;
    const message = error.response?.data?.message;

    if (error.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("persistent");
      window.location.href = "/login";
    }

    if (errorCode === "PROFILE_INCOMPLETE_HARD") {
      import("sonner").then(({ toast }) => {
        toast.error("Feature Locked", {
          description: message || "Complete your profile to unlock this feature.",
        });
      });
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
