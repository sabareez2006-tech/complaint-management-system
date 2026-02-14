import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:4000/api",
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    console.log("🟢 Token in interceptor:", token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
