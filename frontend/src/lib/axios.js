import axios from "axios";

// Suppress MetaMask and other non-critical errors
if (typeof window !== "undefined") {
  const originalError = console.error;
  console.error = function (...args) {
    // Suppress MetaMask connection errors
    if (
      args[0]?.message?.includes("MetaMask") ||
      args[0]?.includes("Failed to connect to MetaMask") ||
      args[0]?.includes("MetaMask extension not found")
    ) {
      return;
    }
    originalError.apply(console, args);
  };
}

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
