// api.js
import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:8000", // your FastAPI backend
});

// Add token to headers for every request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token"); // token saved at login

    console.log(`Request to: ${config.method?.toUpperCase()} ${config.url}`);
    console.log(`Token found: ${token ? 'Yes' : 'No'}`);

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log("Token being sent:", token.substring(0, 20) + "...");
        console.log("Final headers:", config.headers);
    } else {
        console.log("No token found in localStorage");
        console.log("Available localStorage keys:", Object.keys(localStorage));
    }

    return config;
});

// Add response interceptor for debugging
API.interceptors.response.use(
    (response) => {
        console.log(`Response from ${response.config.method?.toUpperCase()} ${response.config.url}:`, response.status);
        return response;
    },
    (error) => {
        console.error(`Error from ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, error.response?.status, error.response?.data);
        return Promise.reject(error);
    }
);

export default API;
