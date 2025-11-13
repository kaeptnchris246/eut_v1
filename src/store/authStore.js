import { useSyncExternalStore } from "react";

const initialState = {
  token: null,
  user: null,
  isAuthenticated: false,
};

let state = { ...initialState };
const listeners = new Set();

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getState = () => state;

const setState = (partial) => {
  state = { ...state, ...partial };
  listeners.forEach((listener) => listener());
};

export const authStore = {
  getState,
  setAuth(token, user) {
    setState({ token, user, isAuthenticated: Boolean(token) });
  },
  logout() {
    setState({ ...initialState });
  },
};

export default function useAuthStore() {
  const snapshot = useSyncExternalStore(subscribe, getState, getState);
  return {
    ...snapshot,
    setAuth: authStore.setAuth,
    logout: authStore.logout,
  };
}
