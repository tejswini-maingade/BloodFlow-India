// Where the admin login token is kept (used in Phase 3C).
// sessionStorage is cleared when the tab closes, which is safer than localStorage for an admin token.
const KEY = 'bloodflow_token';

export const getToken = () => {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
};

export const setToken = (token) => {
  try {
    sessionStorage.setItem(KEY, token);
  } catch {
    /* storage unavailable: user simply has to log in again */
  }
};

export const clearToken = () => {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
};
