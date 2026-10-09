// Keeps the admin session in sessionStorage (cleared when the tab closes).
const TOKEN_KEY = 'bloodflow_token';
const USER_KEY = 'bloodflow_user';

const read = (key) => {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
};

const write = (key, value) => {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    /* storage unavailable: the user simply has to log in again */
  }
};

export const getToken = () => read(TOKEN_KEY);

export const getUser = () => {
  const raw = read(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const saveSession = (token, user) => {
  write(TOKEN_KEY, token);
  write(USER_KEY, JSON.stringify(user));
};

export const clearSession = () => {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  } catch {
    /* ignore */
  }
};
