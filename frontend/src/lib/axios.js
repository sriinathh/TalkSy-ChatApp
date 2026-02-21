import axios from "axios";

// API base URL: use Render backend
export const axiosInstance = axios.create({
  baseURL: "https://talksy-chatapp-18xy.onrender.com/api",
  withCredentials: true,
  timeout: 10000,
});

// Log axios requests and responses for debugging
axiosInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    console.error("Axios request error:", error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token might have expired, log it but don't spam console
      if (error.config.url !== "/auth/check") {
        console.warn("Unauthorized request to:", error.config.url);
      }
    }
    return Promise.reject(error);
  }
);
