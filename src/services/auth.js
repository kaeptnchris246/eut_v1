import api from "@/services/api";
import { authStore } from "@/store/authStore";

export const login = async (credentials) => {
  const data = await api.login(credentials);
  authStore.setAuth(data.token, data.user);
  return data.user;
};

export const signup = async (payload) => {
  const data = await api.signup(payload);
  authStore.setAuth(data.token, data.user);
  return data.user;
};

export const fetchProfile = async () => {
  const data = await api.getProfile();
  const token = authStore.getState().token;
  authStore.setAuth(token, data.user);
  return data.user;
};

export const logout = () => {
  authStore.logout();
};
