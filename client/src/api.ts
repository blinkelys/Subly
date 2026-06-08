// src/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "https://subly.blinkelys.com/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: interceptors (nice for auth later)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // handle logout / redirect if you want
    }
    return Promise.reject(err);
  }
);

export default api;