// src/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
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