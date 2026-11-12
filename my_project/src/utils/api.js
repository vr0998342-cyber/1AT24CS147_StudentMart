// Base API configuration and helper functions for StudentMart

const API_BASE = "http://localhost:5002/api";

export const getAuthToken = () => {
    return localStorage.getItem("token") || localStorage.getItem("studentmartToken") || "";
};

export const getCurrentUser = () => {
    try {
        const raw = localStorage.getItem("user") || localStorage.getItem("studentmartUser");
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

export const setAuthSession = (token, user) => {
    if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("studentmartToken", token);
    }
    if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("studentmartUser", JSON.stringify(user));
        localStorage.setItem("isLoggedIn", "true");
    }
};

export const clearAuthSession = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("studentmartToken");
    localStorage.removeItem("user");
    localStorage.removeItem("studentmartUser");
    localStorage.removeItem("isLoggedIn");
};

// Generic fetch wrapper with auth header
export async function apiFetch(endpoint, options = {}) {
    const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;
    const token = getAuthToken();

    const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
    };

    const config = {
        ...options,
        headers
    };

    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
}

export default {
    API_BASE,
    getAuthToken,
    getCurrentUser,
    setAuthSession,
    clearAuthSession,
    apiFetch
};
