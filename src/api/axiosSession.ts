import axios from "axios";
import { API_SESSION_URL } from "../config/env";

//Creating a reusable Axios instance
const api = axios.create({
    baseURL: API_SESSION_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: false,    
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("authToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log("Request:", config.method?.toUpperCase(), config.url);
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => {
        console.log("Response:", response.status, response.config.url);
        return response;
    },
    (error) => {
        if (error.response) {
            console.error("API Error:", error.response.status, error.response.data);
        }
        else {
            console.error("Network Error:", error.message);
        }
        return Promise.reject(error);
    }
);

export default api;