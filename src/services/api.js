import { authStore } from "@/store/authStore";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

const buildUrl = (path, params) => {
  if (!API_BASE_URL) {
    throw new Error("VITE_API_BASE_URL is not configured");
  }
  const url = new URL(path, API_BASE_URL);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  return url.toString();
};

const parseResponse = async (response) => {
  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");
  const data = isJson ? await response.json() : await response.text();
  if (!response.ok) {
    const message = isJson ? data?.message ?? "Request failed" : "Request failed";
    const error = new Error(message);
    error.status = response.status;
    error.details = isJson ? data?.details : undefined;
    throw error;
  }
  return data;
};

export const request = async (path, { method = "GET", body, params, skipAuth = false } = {}) => {
  const url = buildUrl(path, params);
  const headers = new Headers({ "Content-Type": "application/json" });
  if (!skipAuth) {
    const { token } = authStore.getState();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  return parseResponse(response);
};

const api = {
  signup: (payload) => request("/auth/signup", { method: "POST", body: payload, skipAuth: true }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload, skipAuth: true }),
  getProfile: () => request("/auth/me"),
  getFunds: () => request("/funds"),
  getFund: (id) => request(`/funds/${id}`),
  createFund: (payload) => request("/funds", { method: "POST", body: payload }),
  createCommitment: (payload) => request("/commitments", { method: "POST", body: payload }),
  getMyCommitments: () => request("/commitments/me"),
  confirmCommitment: (id) => request(`/commitments/${id}/confirm`, { method: "PATCH" }),
  cancelCommitment: (id) => request(`/commitments/${id}/cancel`, { method: "PATCH" }),
  getMyTransactions: () => request("/transactions/me"),
  getMyWallets: () => request("/wallets/me"),
  createWallet: (payload) => request("/wallets", { method: "POST", body: payload }),
};

export default api;
